from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db.models import Sum
from datetime import datetime, date, timedelta
from .models import Employee, ScanEntry, SalaryRecord
from .serializers import EmployeeSerializer, ScanEntrySerializer, SalaryRecordSerializer
from .permissions import IsAdminRole
import calendar
import math
from django.http import JsonResponse

def root_view(request):
    return JsonResponse({
        "message": "Scanner Project Backend is running!",
        "api_root": "/api/",
        "admin": "/admin/"
    })

def get_working_days(year, month):
    num_days = calendar.monthrange(year, month)[1]
    working_days = 0
    for day in range(1, num_days + 1):
        if date(year, month, day).weekday() != 6: # Sunday is 6
            working_days += 1
    return working_days

def get_employee_for_user(user):
    employee = Employee.objects.filter(user=user).first()
    if not employee:
        employee = Employee.objects.filter(name__iexact=user.username).first()
    return employee

def is_admin_user(user, employee=None):
    if user.is_superuser:
        return True
    if not employee:
        employee = get_employee_for_user(user)
    return bool(employee and employee.role == 'Admin')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    today = date.today()
    year = today.year
    month = today.month

    working_days = get_working_days(year, month)
    total_target_scans = working_days * 2250

    employee = get_employee_for_user(request.user)
    is_admin = is_admin_user(request.user, employee)

    month_scans = ScanEntry.objects.filter(date__month=month, date__year=year)
    
    if not is_admin:
        month_scans = month_scans.filter(user=request.user)
    
    # Collective total is always the sum of ALL scans in the month
    collective_scans = month_scans.aggregate(Sum('scan_count'))['scan_count__sum'] or 0
    
    # Individual total is only for the current user
    individual_scans = month_scans.filter(user=request.user).aggregate(Sum('scan_count'))['scan_count__sum'] or 0

    # Formulas for salary estimates
    shared_salary = ((collective_scans / 2250) * 800) / 2
    personal_salary = ((individual_scans / 2250) * 800)

    remaining_scans = max(0, total_target_scans - collective_scans)
    
    # Calculate remaining working days (excluding Sundays)
    remaining_working_days = sum(
        1
        for day in range(today.day, calendar.monthrange(year, month)[1] + 1)
        if date(year, month, day).weekday() != 6
    )
    
    required_scans_per_day = math.ceil(remaining_scans / remaining_working_days) if remaining_working_days else 0
    progress_percentage = min(100, (collective_scans / total_target_scans * 100) if total_target_scans > 0 else 0)

    # Calculate per-person breakdown for admins
    employee_breakdown = []
    if is_admin:
        # Since month_scans is filtered for non-admins earlier, we need to query again or just use it because for admin it has all scans
        for emp in Employee.objects.all():
            emp_scans = month_scans.filter(employee=emp).aggregate(Sum('scan_count'))['scan_count__sum'] or 0
            emp_salary = ((emp_scans / 2250) * 800)
            employee_breakdown.append({
                "name": emp.name,
                "scans": emp_scans,
                "salary": round(emp_salary, 2)
            })

    return Response({
        "authenticated_username": request.user.username,
        "is_admin": is_admin,
        "current_month": today.strftime("%B %Y"),
        "working_days": working_days,
        "collective_scans": collective_scans,
        "individual_scans": individual_scans,
        "shared_salary_estimate": round(shared_salary, 2),
        "personal_salary_estimate": round(personal_salary, 2),
        "remaining_scans": remaining_scans,
        "required_scans_per_day": required_scans_per_day,
        "progress_percentage": round(progress_percentage, 1),
        "target_scans": total_target_scans,
        "employee_breakdown": employee_breakdown
    }, headers={'Cache-Control': 'no-store'})

class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        employee = get_employee_for_user(user)
        if is_admin_user(user, employee):
            return Employee.objects.all()
        return Employee.objects.filter(id=employee.id) if employee else Employee.objects.none()

    def perform_create(self, serializer):
        if not is_admin_user(self.request.user):
            raise PermissionDenied("Only admins can create employees.")
        serializer.save()

    def perform_update(self, serializer):
        if not is_admin_user(self.request.user):
            raise PermissionDenied("Only admins can edit employees.")
        serializer.save()

    def perform_destroy(self, instance):
        if not is_admin_user(self.request.user):
            raise PermissionDenied("Only admins can delete employees.")
        instance.delete()

class ScanEntryViewSet(viewsets.ModelViewSet):
    serializer_class = ScanEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        employee = get_employee_for_user(user)
        if is_admin_user(user, employee):
            return ScanEntry.objects.all().order_by('-date')
        return ScanEntry.objects.filter(user=user).order_by('-date')

    def perform_create(self, serializer):
        employee = get_employee_for_user(self.request.user)
        # Automatically assign the logged-in user as owner
        serializer.save(user=self.request.user, employee=employee)

class SalaryRecordViewSet(viewsets.ModelViewSet):
    queryset = SalaryRecord.objects.all().order_by('-month')
    serializer_class = SalaryRecordSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

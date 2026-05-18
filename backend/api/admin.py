from django.contrib import admin
from .models import Employee, ScanEntry, SalaryRecord

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'name', 'role', 'status')
    search_fields = ('name', 'employee_id')
    list_filter = ('role', 'status')

@admin.register(ScanEntry)
class ScanEntryAdmin(admin.ModelAdmin):
    list_display = ('employee', 'scan_count', 'date')
    list_filter = ('date', 'employee')
    search_fields = ('employee__name',)

@admin.register(SalaryRecord)
class SalaryRecordAdmin(admin.ModelAdmin):
    list_display = ('month', 'total_scans', 'salary_per_employee', 'total_payout')
    list_filter = ('month',)

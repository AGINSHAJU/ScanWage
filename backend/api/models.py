from django.db import models
from django.contrib.auth.models import User

class Employee(models.Model):
    ROLE_CHOICES = (
        ('Employee', 'Employee'),
        ('Manager', 'Manager'),
        ('Admin', 'Admin'),
    )
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    )
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='employee_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Employee')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    
    def __str__(self):
        return f"{self.name} ({self.employee_id})"

class ScanEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scan_entries', null=True, blank=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='scans', null=True, blank=True)
    date = models.DateField()
    scan_count = models.IntegerField()
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.employee.name} - {self.date} - {self.scan_count} scans"

class SalaryRecord(models.Model):
    month = models.DateField() # Store the first day of the month e.g. 2026-05-01
    total_scans = models.IntegerField()
    salary_per_employee = models.DecimalField(max_digits=10, decimal_places=2)
    total_payout = models.DecimalField(max_digits=12, decimal_places=2)
    
    def __str__(self):
        return f"{self.month.strftime('%Y-%m')} - Total Payout: {self.total_payout}"

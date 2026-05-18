from datetime import date

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from .models import Employee, ScanEntry


class EmployeeDataIsolationTests(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(username='A', password='pass')
        self.user_b = User.objects.create_user(username='B', password='pass')
        self.admin = User.objects.create_user(username='admin', password='pass')

        self.employee_a = Employee.objects.create(user=self.user_a, employee_id='EMP-A', name='A')
        self.employee_b = Employee.objects.create(user=self.user_b, employee_id='EMP-B', name='B')
        self.admin_employee = Employee.objects.create(
            user=self.admin,
            employee_id='EMP-ADMIN',
            name='Admin',
            role='Admin',
        )

        today = date.today()
        ScanEntry.objects.create(employee=self.employee_a, date=today, scan_count=100)
        ScanEntry.objects.create(employee=self.employee_b, date=today, scan_count=300)

    def test_employee_dashboard_only_returns_own_scan_totals(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.get('/api/dashboard/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['individual_scans'], 100)
        self.assertEqual(response.data['collective_scans'], 100)

    def test_admin_dashboard_returns_team_scan_totals(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get('/api/dashboard/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['collective_scans'], 400)

    def test_employee_cannot_create_scan_for_another_employee(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.post('/api/scans/', {
            'employee': self.employee_b.id,
            'date': date.today().isoformat(),
            'scan_count': 50,
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(ScanEntry.objects.get(id=response.data['id']).employee, self.employee_a)

    def test_employee_cannot_promote_self_to_admin(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.patch('/api/employees/{}/'.format(self.employee_a.id), {
            'role': 'Admin',
        })

        self.assertEqual(response.status_code, 403)
        self.employee_a.refresh_from_db()
        self.assertEqual(self.employee_a.role, 'Employee')

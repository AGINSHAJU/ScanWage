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
        ScanEntry.objects.create(employee=self.employee_a, user=self.user_a, date=today, scan_count=100)
        ScanEntry.objects.create(employee=self.employee_b, user=self.user_b, date=today, scan_count=300)

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


from unittest.mock import patch

class GoogleSheetsSyncTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='admin_user', password='pass')
        self.employee = Employee.objects.create(
            user=self.admin,
            employee_id='EMP-ADMIN-TEST',
            name='Admin User',
            role='Admin',
        )

    @patch('api.signals.trigger_background_sync')
    def test_employee_creation_triggers_sync(self, mock_trigger):
        Employee.objects.create(
            employee_id='EMP-NEW-TEST',
            name='New Employee Test',
            role='Employee'
        )
        self.assertTrue(mock_trigger.called)

    @patch('api.signals.trigger_background_sync')
    def test_scan_entry_creation_triggers_sync(self, mock_trigger):
        ScanEntry.objects.create(
            employee=self.employee,
            date=date.today(),
            scan_count=10
        )
        self.assertTrue(mock_trigger.called)

    @patch('api.google_sheets.sync_data_to_sheets')
    def test_force_sync_endpoint_requires_admin(self, mock_sync):
        self.client.force_authenticate(user=self.admin)
        mock_sync.return_value = (True, "Success")
        
        response = self.client.post('/api/sheets/sync/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(mock_sync.called)

    def test_force_sync_endpoint_denies_non_admin(self):
        regular_user = User.objects.create_user(username='regular_user', password='pass')
        self.client.force_authenticate(user=regular_user)
        
        response = self.client.post('/api/sheets/sync/')
        self.assertEqual(response.status_code, 403)


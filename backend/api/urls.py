from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, ScanEntryViewSet, SalaryRecordViewSet, dashboard_stats, force_sheets_sync
from .auth_views import login_view, google_login_view

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'scans', ScanEntryViewSet, basename='scan')
router.register(r'salaries', SalaryRecordViewSet, basename='salary')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_stats, name='dashboard_stats'),
    path('auth/login/', login_view, name='login'),
    path('auth/google/', google_login_view, name='google_login'),
    path('sheets/sync/', force_sheets_sync, name='force_sheets_sync'),
]


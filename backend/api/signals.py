from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Employee, ScanEntry
from .google_sheets import trigger_background_sync

@receiver(post_save, sender=Employee)
def employee_saved(sender, instance, **kwargs):
    trigger_background_sync()

@receiver(post_delete, sender=Employee)
def employee_deleted(sender, instance, **kwargs):
    trigger_background_sync()

@receiver(post_save, sender=ScanEntry)
def scan_entry_saved(sender, instance, **kwargs):
    trigger_background_sync()

@receiver(post_delete, sender=ScanEntry)
def scan_entry_deleted(sender, instance, **kwargs):
    trigger_background_sync()

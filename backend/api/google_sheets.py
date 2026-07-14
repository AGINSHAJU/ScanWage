import json
import logging
import threading
from django.conf import settings
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

logger = logging.getLogger(__name__)
_sync_lock = threading.Lock()

def get_sheets_session():
    """
    Load credentials from settings and return an AuthorizedSession and spreadsheet ID.
    Returns (None, None) if not configured or auth fails.
    """
    if getattr(settings, 'IS_TESTING', False):
        logger.info("Sync skipped: Currently in testing mode.")
        return None, None

    creds_json = getattr(settings, 'GOOGLE_SERVICE_ACCOUNT_JSON', None)
    spreadsheet_id = getattr(settings, 'GOOGLE_SHEETS_SPREADSHEET_ID', None)

    if not creds_json or not spreadsheet_id:
        logger.warning("Google Sheets sync skipped: GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SHEETS_SPREADSHEET_ID are not configured.")
        return None, None

    try:
        creds_json_str = creds_json.strip()
        if creds_json_str.startswith('{'):
            creds_data = json.loads(creds_json_str)
        else:
            with open(creds_json_str, 'r') as f:
                creds_data = json.load(f)

        credentials = service_account.Credentials.from_service_account_info(
            creds_data,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        session = AuthorizedSession(credentials)
        return session, spreadsheet_id
    except Exception as e:
        logger.error(f"Failed to authenticate with Google Sheets: {e}", exc_info=True)
        return None, None

def sync_employees(session, spreadsheet_id):
    """
    Sync all employees from the local database to the Employees sheet.
    """
    from .models import Employee
    headers = ['ID', 'Employee ID', 'Name', 'Role', 'Status', 'Username']
    rows = [headers]
    for emp in Employee.objects.all().order_by('id'):
        rows.append([
            emp.id,
            emp.employee_id,
            emp.name,
            emp.role,
            emp.status,
            emp.user.username if emp.user else ''
        ])

    try:
        # Clear existing content
        clear_res = session.post(
            f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/Employees!A:Z:clear"
        )
        if clear_res.status_code != 200:
            logger.error(f"Failed to clear Employees sheet: {clear_res.text}")
            return False

        # Update sheet values
        update_res = session.put(
            f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/Employees!A1?valueInputOption=USER_ENTERED",
            json={"values": rows}
        )
        if update_res.status_code != 200:
            logger.error(f"Failed to update Employees sheet: {update_res.text}")
            return False
        return True
    except Exception as e:
        logger.error(f"Exception during Employees sync: {e}", exc_info=True)
        return False

def sync_scan_entries(session, spreadsheet_id):
    """
    Sync all scan entries from the local database to the ScanEntries sheet.
    """
    from .models import ScanEntry
    headers = ['ID', 'Date', 'Scan Count', 'Notes', 'Employee ID', 'Employee Name', 'Username']
    rows = [headers]
    for s in ScanEntry.objects.all().select_related('employee', 'user').order_by('id'):
        rows.append([
            s.id,
            s.date.isoformat() if s.date else '',
            s.scan_count,
            s.notes or '',
            s.employee.employee_id if s.employee else '',
            s.employee.name if s.employee else '',
            s.user.username if s.user else ''
        ])

    try:
        # Clear existing content
        clear_res = session.post(
            f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/ScanEntries!A:Z:clear"
        )
        if clear_res.status_code != 200:
            logger.error(f"Failed to clear ScanEntries sheet: {clear_res.text}")
            return False

        # Update sheet values
        update_res = session.put(
            f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/ScanEntries!A1?valueInputOption=USER_ENTERED",
            json={"values": rows}
        )
        if update_res.status_code != 200:
            logger.error(f"Failed to update ScanEntries sheet: {update_res.text}")
            return False
        return True
    except Exception as e:
        logger.error(f"Exception during ScanEntries sync: {e}", exc_info=True)
        return False

def sync_data_to_sheets():
    """
    Synchronizes the local database records to Google Sheets.
    """
    with _sync_lock:
        session, spreadsheet_id = get_sheets_session()
        if not session or not spreadsheet_id:
            return False, "Google Sheets credentials are not configured or authentication failed."

        try:
            # 1. Provision sheets if missing
            res = session.get(f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}")
            if res.status_code != 200:
                return False, f"Failed to retrieve spreadsheet details: {res.text}"

            sheets_metadata = res.json().get('sheets', [])
            existing_titles = {sheet.get('properties', {}).get('title') for sheet in sheets_metadata}

            missing_sheets = [title for title in ['Employees', 'ScanEntries'] if title not in existing_titles]
            if missing_sheets:
                requests = [{"addSheet": {"properties": {"title": title}}} for title in missing_sheets]
                batch_res = session.post(
                    f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}:batchUpdate",
                    json={"requests": requests}
                )
                if batch_res.status_code != 200:
                    return False, f"Failed to auto-provision sheets {missing_sheets}: {batch_res.text}"

            # 2. Sync Employees
            emp_success = sync_employees(session, spreadsheet_id)
            if not emp_success:
                return False, "Failed to synchronize Employees tab."

            # 3. Sync ScanEntries
            scan_success = sync_scan_entries(session, spreadsheet_id)
            if not scan_success:
                return False, "Failed to synchronize ScanEntries tab."

            return True, "Successfully synchronized all data to Google Sheets."
        except Exception as e:
            logger.error(f"Exception in sync_data_to_sheets: {e}", exc_info=True)
            return False, f"Sync operation failed: {str(e)}"

def trigger_background_sync():
    """
    Triggers the synchronization function asynchronously in a background thread.
    """
    thread = threading.Thread(target=sync_data_to_sheets)
    thread.daemon = True
    thread.start()

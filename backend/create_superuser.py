import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

def main():
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME') or os.environ.get('DJANGO_SUPERUSER_USERNAM')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

    if not username or not password:
        print("Superuser creation/update skipped: DJANGO_SUPERUSER_USERNAME or DJANGO_SUPERUSER_PASSWORD not set in environment.")
        return

    try:
        user = User.objects.get(username=username)
        print(f"Superuser '{username}' already exists. Updating password and permissions...")
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Superuser '{username}' password and permissions updated successfully.")
    except User.DoesNotExist:
        print(f"Creating superuser '{username}'...")
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"Superuser '{username}' created successfully.")

if __name__ == '__main__':
    main()

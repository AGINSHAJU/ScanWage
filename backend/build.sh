#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create superuser automatically if environment variables are set
if [ "$CREATE_SUPERUSER" = "True" ]; then
    echo "Creating superuser..."
    python manage.py createsuperuser --noinput || true
fi

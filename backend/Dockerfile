# Use an official Python runtime as a parent image
FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Run collectstatic during build time
RUN python manage.py collectstatic --no-input

# Expose port
ENV PORT=8000
EXPOSE ${PORT}

# Start command: run migrations, create superuser (if enabled), and start gunicorn
CMD ["sh", "-c", "python manage.py migrate && if [ \"$CREATE_SUPERUSER\" = \"True\" ]; then python create_superuser.py; fi && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]

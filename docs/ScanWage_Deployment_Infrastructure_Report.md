# ScanWage Deployment and Infrastructure Report

## Project Overview

Project name: ScanWage

Purpose:

- Django REST API backend
- PostgreSQL database using Supabase
- Frontend hosted on Cloudflare Pages
- Production backend deployed on Render

## Backend Deployment

Platform: Render

Backend stack:

- Python Django
- Django REST Framework
- Gunicorn
- PostgreSQL

Render service name:

```text
scanwage-api
```

Production URLs:

- Backend: https://scanwage-api.onrender.com
- API: https://scanwage-api.onrender.com/api
- Admin: https://scanwage-api.onrender.com/admin
- Frontend: deployed on Cloudflare Pages

## Database Setup

Platform: Supabase

Database type: PostgreSQL

The first backend deployment failed because Render could not reach the direct Supabase database endpoint. The error was:

```text
OperationalError:
Network is unreachable
connection to db.xxxxx.supabase.co:5432 failed
```

The working fix was to use the Supabase connection pooler on port `6543`.

Final `DATABASE_URL` format:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

## Render Environment Variables

```env
DEBUG=False
SECRET_KEY=<generated-secret-key>
ALLOWED_HOSTS=scanwage-api.onrender.com
DATABASE_URL=<supabase-pooled-url>
DB_SSL_REQUIRE=True
CREATE_SUPERUSER=False
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=<strong-admin-password>
GOOGLE_CLIENT_ID=<google-client-id-if-used>
```

`CREATE_SUPERUSER=True` was used only for the first successful deployment. It was then changed to `False` to avoid recreating the admin user on every deploy.

## Issues Solved

Invalid `DATABASE_URL`

- Problem: extra space after `postgres:`
- Wrong: `postgresql://postgres: PASSWORD@...`
- Correct: `postgresql://postgres:PASSWORD@...`

Supabase direct connection failure

- Problem: Render could not reach the direct Supabase database endpoint.
- Fix: switched to Supabase pooled connection string on port `6543`.

Missing SSL requirement

- Fix: added `DB_SSL_REQUIRE=True`.

Cloudflare Pages setup

- Problem: Cloudflare Workers was opened first.
- Fix: Cloudflare Pages is the correct product for this React/Vite frontend.

Cloudflare package error

- Error: `npm ERR! enoent Could not read package.json`
- Reason: the frontend app is inside the `frontend` subfolder.
- Fix: set the Cloudflare Pages root directory to `frontend`.

## Cloudflare Pages Settings

Framework preset:

```text
React (Vite)
```

Build settings:

```text
Root directory: /
Build command: npm run build
Output directory: dist
```

Alternative Cloudflare Pages setup:

```text
Root directory: frontend
Build command: npm run build
Output directory: dist
```

The repository includes a root `package.json` build wrapper so Cloudflare can also build successfully when it starts from the repository root.

Frontend environment variables:

```env
VITE_API_URL=https://scanwage-api.onrender.com/api
VITE_GOOGLE_CLIENT_ID=<google-client-id-if-used>
```

## Backend Success Indicators

Render logs confirmed:

```text
Running 'gunicorn config.wsgi:application'
Your service is live
Available at your primary URL
```

API root response:

```json
{
  "detail": "Authentication credentials were not provided."
}
```

This means the backend is reachable, authentication is active, and protected endpoints are enabled.

## Production Status

- Backend: Live
- Database: Connected
- Admin panel: Working
- Authentication: Working
- API: Working
- Frontend deployment: Live

## Security Recommendations

- Change the initial admin password.
- Keep `DEBUG=False`.
- Keep `ALLOWED_HOSTS=scanwage-api.onrender.com`.
- Do not use `ALLOWED_HOSTS=*` in production.
- Do not commit real secrets or database URLs.

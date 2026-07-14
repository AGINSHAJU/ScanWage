# ScanWage Deployment Guide

## Production URLs

- Backend: https://scanwage-api.onrender.com
- API: https://scanwage-api.onrender.com/api
- Admin: https://scanwage-api.onrender.com/admin
- Frontend: deployed on Cloudflare Pages

## Final Infrastructure

- Frontend: Cloudflare Pages, React, Vite
- Backend: Render, Django REST Framework, Gunicorn
- Database: Supabase PostgreSQL

## Backend on Render

Render service name:

```text
scanwage-api
```

Render environment variables:

```env
DEBUG=False
SECRET_KEY=<generated-secret-key>
ALLOWED_HOSTS=scanwage-api.onrender.com
DATABASE_URL=<supabase-pooled-database-url>
DB_SSL_REQUIRE=True
CREATE_SUPERUSER=False
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=<strong-admin-password>
GOOGLE_CLIENT_ID=<google-client-id-if-used>
```

For the first deploy only, `CREATE_SUPERUSER=True` can be used to create the initial admin account. After the first successful deploy, set it back to `False`.

## Supabase Database

Use Supabase PostgreSQL with the connection pooler, not the direct database URL.

Use this format:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

Do not add a space after `postgres:`. This is wrong:

```env
postgresql://postgres: PASSWORD@...
```

This is correct:

```env
postgresql://postgres:PASSWORD@...
```

Keep SSL enabled:

```env
DB_SSL_REQUIRE=True
```

## Cloudflare Pages Frontend

Use Cloudflare Pages, not Cloudflare Workers.

Build settings:

```text
Framework preset: React (Vite)
Root directory: /
Build command: npm run build
Output directory: dist
```

Alternative setup:

```text
Root directory: frontend
Build command: npm run build
Output directory: dist
```

If Cloudflare shows `Could not read package.json` at `/opt/buildhome/repo/package.json`, it is building from the repository root. Keep the root directory as `/` and use the root `package.json` build wrapper, or switch the root directory to `frontend`.

Frontend environment variables:

```env
VITE_API_URL=https://scanwage-api.onrender.com/api
VITE_GOOGLE_CLIENT_ID=<google-client-id-if-used>
```

## Production Checks

Backend deploy logs should show:

```text
Running 'gunicorn config.wsgi:application'
Your service is live
Available at your primary URL
```

If the API root returns this, the backend is reachable and protected authentication is active:

```json
{
  "detail": "Authentication credentials were not provided."
}
```

Cloudflare Pages deploy logs should show:

```text
vite build
Success: Assets published!
Success: Your site was deployed!
```

## Issues Already Solved

1. Invalid database URL caused by an extra space after `postgres:`.
2. Render could not connect to the direct Supabase database endpoint on port `5432`.
3. Supabase pooler URL on port `6543` fixed the Render connection problem.
4. `DB_SSL_REQUIRE=True` was added for secure database connections.
5. Cloudflare Pages needed `frontend` as the root directory because `package.json` is inside that folder.

## Security Notes

- Change the admin password used during first deployment.
- Keep `DEBUG=False` in production.
- Keep `ALLOWED_HOSTS=scanwage-api.onrender.com`.
- Never commit real `SECRET_KEY`, `DATABASE_URL`, or admin password values.

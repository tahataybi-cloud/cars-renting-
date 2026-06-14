# Deployment Guide

## Local

```bash
cp .env.example .env
docker compose up --build
```

## Production Checklist

- Replace `JWT_SECRET` with a long random secret stored in a secret manager.
- Use managed PostgreSQL with automated backups.
- Configure Cloudinary credentials for customer documents, car images, damage images, and contracts.
- Put Nginx or a cloud gateway in front of the services with TLS.
- Enable rate limiting for `/auth/**` and write-heavy endpoints.
- Add observability: structured logs, metrics, traces, uptime checks.
- Configure CI/CD secrets and environment-specific `.env` values.


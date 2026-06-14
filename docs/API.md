# API Overview

Base URL: `/api`

## Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/verify-email`

## Fleet

- `GET /cars`
- `POST /cars`
- `GET /cars/{id}`
- `PATCH /cars/{id}/status`
- `POST /cars/{id}/images`

## Bookings

- `GET /bookings`
- `POST /bookings`
- `PATCH /bookings/{id}/approve`
- `PATCH /bookings/{id}/cancel`
- `GET /bookings/availability`

## Operations

- `GET /dashboard/summary`
- `GET /maintenance`
- `GET /insurance/expiring`
- `GET /technical-inspections/due`
- `POST /damage-reports`
- `POST /contracts/{bookingId}/generate`
- `POST /notifications/send`

Swagger UI is available at `/api/swagger-ui.html`.


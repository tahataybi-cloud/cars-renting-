# SmartRent Morocco

Modern SaaS platform for Moroccan car rental agencies: fleet, bookings, contracts, deposits, maintenance, GPS alerts, CRM, notifications, and analytics.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, React Query, Axios
- Backend: Spring Boot, Spring Security, JWT, JPA, Flyway, PostgreSQL
- Analytics: FastAPI, Pandas, Scikit-learn
- Storage: Cloudinary-ready integration points
- Infra: Docker Compose, Nginx

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html
- Analytics service: http://localhost:8000/docs
- PostgreSQL: localhost:5432

## Demo Credentials

Seed these through the API or database according to your environment policy. The schema and services are ready for role based access with `SUPER_ADMIN`, `AGENCY_OWNER`, `EMPLOYEE`, and `CUSTOMER`.


# SmartRent Morocco Architecture

SmartRent Morocco is split into four deployable layers:

1. React web app for agency operations.
2. Spring Boot REST API for identity, bookings, fleet, contracts, deposits, compliance, GPS, and CRM.
3. PostgreSQL database with strong constraints for overlap prevention and auditability.
4. Python analytics service for demand, profitability, retention, and maintenance risk predictions.

## Core Domains

- Identity and access: users, roles, permissions, JWT, refresh tokens.
- Fleet: cars, categories, images, status, insurance, inspections, maintenance.
- Reservations: bookings, payments, deposits, contracts, double-booking prevention.
- Customer trust: documents, OCR extraction fields, reviews, loyalty points.
- Operations: notifications, audit logs, GPS tracking, damage reports.
- Intelligence: analytics reports and prediction endpoints.

## Double Booking Strategy

Booking creation checks date overlap in the API. PostgreSQL also enforces no active overlap for the same vehicle with a date range index, so concurrency cannot bypass application validation.

## Security

The backend uses Spring Security, BCrypt password hashing, JWT access tokens, role-ready authorities, validation annotations, CORS, and audit log storage. Production hardening should add API rate limiting at Nginx or gateway level, refresh-token rotation persistence, CSRF protection for cookie-based auth, and centralized secret management.


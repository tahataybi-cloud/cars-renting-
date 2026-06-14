-- Canonical migrations live in /database/migrations for Docker bootstrap and DBA review.
-- In Docker Compose, PostgreSQL applies them before the backend starts. Keep this
-- Flyway migration as a version marker so application startup does not try to
-- execute psql-only include commands from the classpath.
SELECT 1;

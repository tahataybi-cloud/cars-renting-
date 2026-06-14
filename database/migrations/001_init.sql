CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(64) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(96) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(160) NOT NULL,
  city VARCHAR(80) NOT NULL,
  address TEXT,
  phone VARCHAR(40),
  email VARCHAR(180),
  tax_identifier VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  phone VARCHAR(40),
  password_hash TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  cin VARCHAR(40),
  passport_number VARCHAR(60),
  driving_license_number VARCHAR(60),
  license_expiration_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE car_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  daily_rate NUMERIC(12,2) NOT NULL CHECK (daily_rate >= 0),
  deposit_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  UNIQUE (agency_id, name)
);

CREATE TYPE car_status AS ENUM ('AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE', 'OUT_OF_SERVICE');
CREATE TYPE fuel_type AS ENUM ('DIESEL', 'PETROL', 'HYBRID', 'ELECTRIC');
CREATE TYPE transmission_type AS ENUM ('MANUAL', 'AUTOMATIC');

CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES car_categories(id) ON DELETE SET NULL,
  brand VARCHAR(80) NOT NULL,
  model VARCHAR(80) NOT NULL,
  year INT NOT NULL CHECK (year BETWEEN 1990 AND 2100),
  mileage INT NOT NULL DEFAULT 0 CHECK (mileage >= 0),
  fuel_type fuel_type NOT NULL,
  transmission transmission_type NOT NULL,
  plate_number VARCHAR(40) NOT NULL UNIQUE,
  status car_status NOT NULL DEFAULT 'AVAILABLE',
  daily_rate NUMERIC(12,2) NOT NULL CHECK (daily_rate >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE car_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  public_id VARCHAR(180),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE booking_status AS ENUM ('PENDING', 'APPROVED', 'CANCELLED', 'ACTIVE', 'COMPLETED', 'NO_SHOW');

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status booking_status NOT NULL DEFAULT 'PENDING',
  pickup_at TIMESTAMPTZ NOT NULL,
  return_at TIMESTAMPTZ NOT NULL,
  daily_rate NUMERIC(12,2) NOT NULL CHECK (daily_rate >= 0),
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT booking_dates_valid CHECK (return_at > pickup_at)
);

ALTER TABLE bookings ADD CONSTRAINT bookings_no_active_overlap
EXCLUDE USING gist (
  car_id WITH =,
  tstzrange(pickup_at, return_at, '[)') WITH &&
)
WHERE (status IN ('PENDING', 'APPROVED', 'ACTIVE'));

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  contract_number VARCHAR(80) NOT NULL UNIQUE,
  pdf_url TEXT,
  signed_pdf_url TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE payment_method AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'CHECK', 'ONLINE');

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  reference VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE deposit_status AS ENUM ('PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED', 'BLOCKED');

CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  status deposit_status NOT NULL DEFAULT 'PENDING',
  reason TEXT
);

CREATE TABLE maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  type VARCHAR(80) NOT NULL,
  description TEXT,
  mileage_at_service INT CHECK (mileage_at_service >= 0),
  due_at DATE,
  completed_at DATE,
  cost NUMERIC(12,2) DEFAULT 0 CHECK (cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  company VARCHAR(140) NOT NULL,
  contract_number VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  document_url TEXT,
  CONSTRAINT insurance_dates_valid CHECK (end_date > start_date)
);

CREATE TABLE technical_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  inspection_date DATE NOT NULL,
  next_due_date DATE NOT NULL,
  result VARCHAR(80) NOT NULL,
  document_url TEXT
);

CREATE TABLE damage_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  stage VARCHAR(32) NOT NULL CHECK (stage IN ('BEFORE_RENTAL', 'AFTER_RENTAL')),
  description TEXT NOT NULL,
  estimated_cost NUMERIC(12,2) DEFAULT 0 CHECK (estimated_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE damage_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  damage_report_id UUID NOT NULL REFERENCES damage_reports(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  public_id VARCHAR(180),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gps_tracking (
  id BIGSERIAL PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  speed_kmh NUMERIC(8,2) NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  channel VARCHAR(32) NOT NULL CHECK (channel IN ('EMAIL', 'SMS', 'WHATSAPP', 'IN_APP')),
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customer_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(60) NOT NULL CHECK (type IN ('CIN', 'PASSPORT', 'DRIVING_LICENSE')),
  url TEXT NOT NULL,
  extracted_full_name VARCHAR(160),
  extracted_number VARCHAR(80),
  extracted_expiration_date DATE,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(120) NOT NULL,
  entity_id UUID,
  ip_address INET,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INT NOT NULL,
  reason VARCHAR(160) NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_agency ON users(agency_id);
CREATE INDEX idx_cars_agency_status ON cars(agency_id, status);
CREATE INDEX idx_bookings_agency_status ON bookings(agency_id, status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_maintenance_due ON maintenance(due_at) WHERE completed_at IS NULL;
CREATE INDEX idx_insurance_end_date ON insurance(end_date);
CREATE INDEX idx_inspections_due ON technical_inspections(next_due_date);
CREATE INDEX idx_gps_car_time ON gps_tracking(car_id, recorded_at DESC);
CREATE INDEX idx_notifications_schedule ON notifications(status, scheduled_at);
CREATE INDEX idx_audit_logs_agency_time ON audit_logs(agency_id, created_at DESC);

INSERT INTO roles(name, description) VALUES
('SUPER_ADMIN', 'Platform administrator'),
('AGENCY_OWNER', 'Agency owner with billing and configuration access'),
('EMPLOYEE', 'Agency employee'),
('CUSTOMER', 'Rental customer')
ON CONFLICT DO NOTHING;

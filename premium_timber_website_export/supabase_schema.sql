-- =====================================================================
-- TIMBER IMPORT & EXPORT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Target Database: PostgreSQL / Supabase
-- Features: Normalization, UUID Primary Keys, Foreign Keys, Triggers,
--           Indexes, RLS Policies, Automatic Timestamps, Soft Deletes,
--           Role-Based Access Control (RBAC)
-- =====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean existing tables/types (development safety)
DROP TABLE IF EXISTS website_settings CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS customer_inquiries CASCADE;
DROP TABLE IF EXISTS pdf_specifications CASCADE;
DROP TABLE IF EXISTS container_videos CASCADE;
DROP TABLE IF EXISTS container_images CASCADE;
DROP TABLE IF EXISTS containers CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS species CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

DROP TYPE IF EXISTS container_status_type CASCADE;
DROP TYPE IF EXISTS container_size_type CASCADE;
DROP TYPE IF EXISTS reservation_status_type CASCADE;
DROP TYPE IF EXISTS order_status_type CASCADE;
DROP TYPE IF EXISTS payment_status_type CASCADE;
DROP TYPE IF EXISTS inquiry_status_type CASCADE;

-- =====================================================================
-- 1. ENUMS & CONSTANTS
-- =====================================================================

CREATE TYPE container_status_type AS ENUM ('available', 'reserved', 'sold');
CREATE TYPE container_size_type AS ENUM ('20ft', '40ft');
CREATE TYPE reservation_status_type AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE order_status_type AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE payment_status_type AS ENUM ('pending', 'cleared', 'failed');
CREATE TYPE inquiry_status_type AS ENUM ('new', 'contacted', 'negotiating', 'confirmed', 'closed');

-- =====================================================================
-- 2. ROLE-BASED ACCESS CONTROL (RBAC) TABLES
-- =====================================================================

-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'super_admin', 'manager', 'staff'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'manage_inventory', 'view_reports', 'manage_settings'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permissions Junction
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- =====================================================================
-- 3. MASTER & ADMINISTRATIVE TABLES
-- =====================================================================

-- Admin Users (links to auth.users in Supabase)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY, -- Must match auth.users.id
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    avatar_url VARCHAR(1024),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Countries
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(3) UNIQUE, -- ISO-3166-1 alpha-3
    flag VARCHAR(255), -- Flag SVG / emoji / image URL
    description TEXT,
    import_frequency VARCHAR(100) DEFAULT 'Monthly',
    image_url VARCHAR(1024),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Timber Species
CREATE TABLE species (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    scientific_name VARCHAR(150),
    description TEXT,
    grade_specifications TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL, -- Detailed address in Pudukkottai, etc.
    contact_number VARCHAR(50),
    capacity_cft DECIMAL(12, 2),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers CRM
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) NOT NULL UNIQUE,
    gst_number VARCHAR(15) UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 4. INVENTORY & CONTAINER MANAGEMENT
-- =====================================================================

-- Containers Inventory
CREATE TABLE containers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    container_number VARCHAR(50) NOT NULL UNIQUE, -- Serial / ID (auto/manual)
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
    port_loading VARCHAR(100),
    port_arrival VARCHAR(100) DEFAULT 'Chennai Port',
    species_id UUID NOT NULL REFERENCES species(id) ON DELETE RESTRICT,
    arrival_date DATE NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    size container_size_type NOT NULL DEFAULT '40ft',
    logs_count INTEGER NOT NULL CHECK (logs_count > 0),
    
    -- Dimensions (in feet)
    min_length DECIMAL(6, 2) NOT NULL CHECK (min_length > 0),
    max_length DECIMAL(6, 2) NOT NULL CHECK (max_length >= min_length),
    avg_length DECIMAL(6, 2) NOT NULL CHECK (avg_length >= min_length AND avg_length <= max_length),
    
    -- Dimensions (in cm)
    min_diameter DECIMAL(6, 2) NOT NULL CHECK (min_diameter > 0),
    max_diameter DECIMAL(6, 2) NOT NULL CHECK (max_diameter >= min_diameter),
    avg_diameter DECIMAL(6, 2) NOT NULL CHECK (avg_diameter >= min_diameter AND avg_diameter <= max_diameter),
    
    -- Volume
    cft DECIMAL(10, 2) NOT NULL CHECK (cft > 0),
    
    -- Quality
    grade VARCHAR(50) NOT NULL DEFAULT 'FEQ', -- e.g., FEQ, Grade A
    moisture DECIMAL(5, 2), -- Optional percentage
    
    -- Commercial
    price DECIMAL(12, 2), -- Optional listing price
    
    -- Details
    description TEXT,
    special_notes TEXT,
    status container_status_type NOT NULL DEFAULT 'available',
    is_draft BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media files linked to Containers
CREATE TABLE container_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
    url VARCHAR(1024) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE container_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
    url VARCHAR(1024) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pdf_specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
    url VARCHAR(1024) NOT NULL,
    label VARCHAR(255) DEFAULT 'Specification Sheet',
    file_size_bytes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 5. SALES, INQUIRIES, RESERVATIONS, ORDERS & PAYMENTS
-- =====================================================================

-- Customer Inquiries (can be anonymous/website visitor or existing customer)
CREATE TABLE customer_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- optional CRM link
    customer_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    container_id UUID REFERENCES containers(id) ON DELETE SET NULL,
    message TEXT,
    status inquiry_status_type NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reservations
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    status reservation_status_type NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (expiry_date >= start_date)
);

-- Sales Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
    status order_status_type NOT NULL DEFAULT 'pending',
    invoice_number VARCHAR(100) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(100) NOT NULL, -- bank_transfer, check, cash, etc.
    transaction_reference VARCHAR(150),
    status payment_status_type NOT NULL DEFAULT 'pending',
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 6. AUDITING, MESSAGING & SYSTEM SETTINGS
-- =====================================================================

-- Admin Activity Audit Logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- CREATE_CONTAINER, DELETE_CUSTOMER, etc.
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    details JSONB, -- Store JSON diff / description
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- inquiry, reservation, stock, payment, system
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials (Public CMS)
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    image_url VARCHAR(1024),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FAQs (Public CMS)
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    display_order INTEGER DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Global Website Settings (key-value pair)
CREATE TABLE website_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 7. INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================================

-- Container search, status, and filter optimizations
CREATE INDEX idx_containers_status_is_draft ON containers(status, is_draft) WHERE deleted_at IS NULL;
CREATE INDEX idx_containers_country_id ON containers(country_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_containers_species_id ON containers(species_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_containers_arrival_date ON containers(arrival_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_containers_cft ON containers(cft) WHERE deleted_at IS NULL;
CREATE INDEX idx_containers_grade ON containers(grade) WHERE deleted_at IS NULL;

-- Customer Inquiry index
CREATE INDEX idx_inquiries_created_at ON customer_inquiries(created_at DESC);
CREATE INDEX idx_inquiries_status ON customer_inquiries(status);

-- Reservation indices
CREATE INDEX idx_reservations_container_id ON reservations(container_id);
CREATE INDEX idx_reservations_status_expiry ON reservations(status, expiry_date);

-- Audit log indices
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- General lookup indices
CREATE INDEX idx_countries_enabled ON countries(enabled);
CREATE INDEX idx_species_enabled ON species(enabled);
CREATE INDEX idx_warehouses_enabled ON warehouses(enabled);

-- =====================================================================
-- 8. TIMESTAMPS & SOFT DELETE TRIGGERS AND FUNCTIONS
-- =====================================================================

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to relevant tables
CREATE TRIGGER update_roles_modtime BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_permissions_modtime BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_admin_users_modtime BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_countries_modtime BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_species_modtime BEFORE UPDATE ON species FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_warehouses_modtime BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_containers_modtime BEFORE UPDATE ON containers FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_inquiries_modtime BEFORE UPDATE ON customer_inquiries FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_reservations_modtime BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_testimonials_modtime BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_faqs_modtime BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Function: Automatically update container status when reservation is approved
CREATE OR REPLACE FUNCTION handle_reservation_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If reservation is approved, mark the container as reserved
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        UPDATE containers SET status = 'reserved' WHERE id = NEW.container_id;
        
        -- Create a notification
        INSERT INTO notifications (title, message, type, link_url)
        VALUES (
            'Reservation Approved',
            'Container reservation has been approved for customer. Container ID has been updated to Reserved.',
            'reservation',
            '/admin/reservations'
        );
    -- If reservation is rejected or cancelled, release the container back to available
    ELSIF (NEW.status = 'rejected' OR NEW.status = 'cancelled') AND (OLD.status = 'approved' OR OLD.status = 'pending') THEN
        UPDATE containers SET status = 'available' WHERE id = NEW.container_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reservation_status_change
AFTER UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION handle_reservation_status_change();

-- Function: Automatically update container to sold when order is completed
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- If order has a reservation, mark it sold
        IF NEW.reservation_id IS NOT NULL THEN
            UPDATE containers 
            SET status = 'sold' 
            WHERE id = (SELECT container_id FROM reservations WHERE id = NEW.reservation_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION handle_order_status_change();

-- =====================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
-- =====================================================================

-- Helper Function: Check if user has specific permission in RBAC
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, perm_name VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM admin_users au
        JOIN role_permissions rp ON au.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE au.id = user_id AND au.is_active = TRUE AND p.name = perm_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE species ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- 9a. ROLES & PERMISSIONS Policies (RBAC self-management)
CREATE POLICY "Admins can view roles and permissions" ON roles
    FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Super admins can manage roles and permissions" ON roles
    FOR ALL USING (has_permission(auth.uid(), 'manage_settings'));

CREATE POLICY "Admins can view permissions list" ON permissions
    FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Super admins can manage permissions list" ON permissions
    FOR ALL USING (has_permission(auth.uid(), 'manage_settings'));

CREATE POLICY "Admins can view role mapping" ON role_permissions
    FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Super admins can manage role mapping" ON role_permissions
    FOR ALL USING (has_permission(auth.uid(), 'manage_settings'));

-- 9b. ADMIN USERS Policies
CREATE POLICY "Admins can view profiles" ON admin_users
    FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile" ON admin_users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can manage admin accounts" ON admin_users
    FOR ALL USING (has_permission(auth.uid(), 'manage_settings'));

-- 9c. COUNTRIES Policies
CREATE POLICY "Anyone can view enabled countries" ON countries
    FOR SELECT USING (enabled = TRUE);

CREATE POLICY "Admins can view all countries" ON countries
    FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins with manage_settings can modify countries" ON countries
    FOR ALL USING (has_permission(auth.uid(), 'manage_settings'));

-- 9d. SPECIES Policies
CREATE POLICY "Anyone can view enabled species" ON species
    FOR SELECT USING (enabled = TRUE);

CREATE POLICY "Admins can view all species" ON species
    FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins with manage_inventory can modify species" ON species
    FOR ALL USING (has_permission(auth.uid(), 'manage_inventory'));

-- 9e. WAREHOUSES Policies
CREATE POLICY "Admins can view and manage warehouses" ON warehouses
    FOR ALL USING (has_permission(auth.uid(), 'manage_inventory'));

-- 9f. CUSTOMERS Policies
CREATE POLICY "Admins can view and manage customers ledger" ON customers
    FOR ALL USING (has_permission(auth.uid(), 'manage_customers'));

-- 9g. CONTAINERS Policies
CREATE POLICY "Anyone can view active published containers" ON containers
    FOR SELECT USING (is_draft = FALSE AND deleted_at IS NULL);

CREATE POLICY "Admins can view draft/deleted containers" ON containers
    FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins with manage_inventory can modify containers" ON containers
    FOR ALL USING (has_permission(auth.uid(), 'manage_inventory'));

-- 9h. CONTAINER ASSETS (Images, Videos, Spec PDFs)
CREATE POLICY "Anyone can view assets of active containers" ON container_images
    FOR SELECT USING (EXISTS (SELECT 1 FROM containers WHERE id = container_id AND is_draft = FALSE AND deleted_at IS NULL));
CREATE POLICY "Admins can manage container images" ON container_images
    FOR ALL USING (has_permission(auth.uid(), 'manage_inventory'));

CREATE POLICY "Anyone can view videos of active containers" ON container_videos
    FOR SELECT USING (EXISTS (SELECT 1 FROM containers WHERE id = container_id AND is_draft = FALSE AND deleted_at IS NULL));
CREATE POLICY "Admins can manage container videos" ON container_videos
    FOR ALL USING (has_permission(auth.uid(), 'manage_inventory'));

CREATE POLICY "Anyone can view specifications of active containers" ON pdf_specifications
    FOR SELECT USING (EXISTS (SELECT 1 FROM containers WHERE id = container_id AND is_draft = FALSE AND deleted_at IS NULL));
CREATE POLICY "Admins can manage container specifications" ON pdf_specifications
    FOR ALL USING (has_permission(auth.uid(), 'manage_inventory'));

-- 9i. INQUIRIES Policies
CREATE POLICY "Anyone can submit an inquiry" ON customer_inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view and reply to inquiries" ON customer_inquiries
    FOR ALL USING (has_permission(auth.uid(), 'manage_customers'));

-- 9j. RESERVATIONS Policies
CREATE POLICY "Admins with manage_sales can manage reservations" ON reservations
    FOR ALL USING (has_permission(auth.uid(), 'manage_sales'));

-- 9k. ORDERS & PAYMENTS Policies
CREATE POLICY "Admins with manage_sales can manage orders" ON orders
    FOR ALL USING (has_permission(auth.uid(), 'manage_sales'));

CREATE POLICY "Admins with manage_sales can manage payments" ON payments
    FOR ALL USING (has_permission(auth.uid(), 'manage_sales'));

-- 9l. AUDIT LOGS & NOTIFICATIONS Policies
CREATE POLICY "Admins can view activity logs" ON activity_logs
    FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can view and process notifications" ON notifications
    FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- 9m. PUBLIC CMS (Testimonials, FAQs, Settings)
CREATE POLICY "Anyone can view active testimonials" ON testimonials
    FOR SELECT USING (enabled = TRUE);
CREATE POLICY "Admins can manage testimonials" ON testimonials
    FOR ALL USING (has_permission(auth.uid(), 'manage_settings'));

CREATE POLICY "Anyone can view active FAQs" ON faqs
    FOR SELECT USING (enabled = TRUE);
CREATE POLICY "Admins can manage FAQs" ON faqs
    FOR ALL USING (has_permission(auth.uid(), 'manage_settings'));

CREATE POLICY "Anyone can view settings" ON website_settings
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage website settings" ON website_settings
    FOR ALL USING (has_permission(auth.uid(), 'manage_settings'));

-- =====================================================================
-- 10. SEED DATA (INITIAL SETUP MIGRATION)
-- =====================================================================

-- 10a. Seed Roles
INSERT INTO roles (name, description) VALUES
('super_admin', 'Full system access, billing, role modifications, and admin accounts management.'),
('manager', 'Manage inventory, sales, customer inquiries, reports, and reservations.'),
('staff', 'View inventory, reply to inquiries, register customer details.');

-- 10b. Seed Permissions
INSERT INTO permissions (name, description) VALUES
('manage_inventory', 'Create, update, draft, delete and publish timber logs and containers.'),
('manage_customers', 'View customer details, log phone conversations, edit inquiry statuses.'),
('manage_sales', 'Manage, reject, and approve reservations, issue sales invoices, log payments.'),
('manage_settings', 'Modify business profile, hours, FAQs, testimonials, and user permissions.'),
('view_reports', 'Access and export financial reporting, container sales, and inquiry analytics.');

-- 10c. Map Permissions to Roles
-- Super Admin: all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'super_admin';

-- Manager: inventory, customers, sales, reports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'manager' AND p.name IN ('manage_inventory', 'manage_customers', 'manage_sales', 'view_reports');

-- Staff: customers (view/edit queries)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'staff' AND p.name IN ('manage_customers');

-- 10d. Seed Website Settings
INSERT INTO website_settings (key, value, description) VALUES
('company_info', '{
    "name": "Premium Timber Import & Export Company",
    "address": "Pudukkottai, Tamil Nadu, India",
    "phone": "+91 98765 43210",
    "email": "info@premiumtimber.com",
    "whatsapp": "+91 98765 43210",
    "hours": "9:00 AM - 6:00 PM (Monday - Saturday)"
}', 'Company profile settings details');

-- 10e. Seed Importing Countries
INSERT INTO countries (name, code, flag, description, import_frequency) VALUES
('Ecuador', 'ECU', '🇪🇨', 'Premium Teak wood from Ecuador, grown in high-quality river basin soils offering uniform grain and minimal defects.', 'Bi-weekly'),
('Brazil', 'BRA', '🇧🇷', 'Sustainable high-density Teak harvested from certified plantations in Mato Grosso, Brazil.', 'Monthly'),
('Panama', 'PAN', '🇵🇦', 'Panamanian plantation teak round logs, featuring dark stripes and dense fiber structure.', 'Monthly'),
('Ghana', 'GHA', '🇬🇭', 'Tectona grandis (Teak) logs from West Africa, prized for durability and dry weather resilience.', 'Bi-weekly'),
('Tanzania', 'TZA', '🇹🇿', 'East African Teak with high natural oil content and distinct gold-brown colors.', 'Monthly');

-- 10f. Seed Timber Species
INSERT INTO species (name, scientific_name, description, grade_specifications) VALUES
('Teak Wood', 'Tectona grandis', 'Golden-brown hardwood with fine grain, highly durable, water-resistant, and ideal for premium furniture and yacht decks.', 'FEQ (First Export Quality), A-Grade, B-Grade');

-- 10g. Seed Warehouses
INSERT INTO warehouses (name, location, contact_number, capacity_cft) VALUES
('Pudukkottai Main Yard', 'National Highway 336, Pudukkottai, Tamil Nadu, India', '+91 94444 12345', 150000.00),
('Chennai Port Transit Yard', 'Ennore Port Road, Chennai, Tamil Nadu, India', '+91 94444 54321', 50000.00);

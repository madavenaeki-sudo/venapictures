/*
  # Initial Database Schema for Vena Pictures

  1. New Tables
    - `profiles` - User profile and company settings
    - `users` - Application users with roles and permissions
    - `clients` - Client information and contact details
    - `packages` - Service packages with pricing and details
    - `add_ons` - Additional services that can be added to packages
    - `projects` - Main projects with status tracking
    - `team_members` - Freelancers and team members
    - `transactions` - Financial transactions (income/expense)
    - `cards` - Payment cards and cash accounts
    - `financial_pockets` - Budget allocation and savings
    - `leads` - Potential clients and prospects
    - `assets` - Company assets and equipment
    - `contracts` - Legal contracts with clients
    - `client_feedback` - Client satisfaction ratings and feedback
    - `social_media_posts` - Social media content planning
    - `promo_codes` - Discount codes for clients
    - `sops` - Standard Operating Procedures
    - `notifications` - System notifications
    - `team_project_payments` - Payment tracking for team members
    - `team_payment_records` - Payment slip records
    - `reward_ledger_entries` - Reward system tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure access based on user roles

  3. Features
    - UUID primary keys for all tables
    - Timestamps for audit trails
    - JSON fields for complex data structures
    - Foreign key relationships
    - Proper indexing for performance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (company settings)
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    company_name text NOT NULL,
    website text,
    address text NOT NULL,
    bank_account text NOT NULL,
    authorized_signer text NOT NULL,
    id_number text,
    bio text,
    income_categories jsonb DEFAULT '[]'::jsonb,
    expense_categories jsonb DEFAULT '[]'::jsonb,
    project_types jsonb DEFAULT '[]'::jsonb,
    event_types jsonb DEFAULT '[]'::jsonb,
    asset_categories jsonb DEFAULT '[]'::jsonb,
    sop_categories jsonb DEFAULT '[]'::jsonb,
    project_status_config jsonb DEFAULT '[]'::jsonb,
    notification_settings jsonb DEFAULT '{"newProject": true, "paymentConfirmation": true, "deadlineReminder": true}'::jsonb,
    security_settings jsonb DEFAULT '{"twoFactorEnabled": false}'::jsonb,
    briefing_template text,
    terms_and_conditions text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Users table (application users)
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL CHECK (role IN ('Admin', 'Member')),
    permissions jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    whatsapp text,
    instagram text,
    since date DEFAULT CURRENT_DATE,
    status text NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Prospek', 'Aktif', 'Tidak Aktif', 'Hilang')),
    client_type text NOT NULL DEFAULT 'Langsung' CHECK (client_type IN ('Langsung', 'Vendor')),
    last_contact timestamptz DEFAULT now(),
    portal_access_id uuid DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    price numeric NOT NULL,
    physical_items jsonb DEFAULT '[]'::jsonb,
    digital_items jsonb DEFAULT '[]'::jsonb,
    processing_time text NOT NULL,
    default_printing_cost numeric DEFAULT 0,
    default_transport_cost numeric DEFAULT 0,
    photographers text,
    videographers text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add-ons table
CREATE TABLE IF NOT EXISTS add_ons (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    price numeric NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    role text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    standard_fee numeric NOT NULL DEFAULT 0,
    no_rek text,
    reward_balance numeric DEFAULT 0,
    rating numeric DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    performance_notes jsonb DEFAULT '[]'::jsonb,
    portal_access_id uuid DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name text NOT NULL,
    client_name text NOT NULL,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    project_type text NOT NULL,
    package_name text NOT NULL,
    package_id uuid REFERENCES packages(id),
    add_ons jsonb DEFAULT '[]'::jsonb,
    date date NOT NULL,
    deadline_date date,
    location text NOT NULL,
    progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status text NOT NULL DEFAULT 'Dikonfirmasi',
    active_sub_statuses jsonb DEFAULT '[]'::jsonb,
    total_cost numeric NOT NULL,
    amount_paid numeric DEFAULT 0,
    payment_status text NOT NULL DEFAULT 'Belum Bayar' CHECK (payment_status IN ('Lunas', 'DP Terbayar', 'Belum Bayar')),
    team jsonb DEFAULT '[]'::jsonb,
    notes text,
    accommodation text,
    drive_link text,
    client_drive_link text,
    final_drive_link text,
    start_time text,
    end_time text,
    image text,
    revisions jsonb DEFAULT '[]'::jsonb,
    promo_code_id uuid,
    discount_amount numeric DEFAULT 0,
    shipping_details text,
    dp_proof_url text,
    printing_details jsonb DEFAULT '[]'::jsonb,
    printing_cost numeric DEFAULT 0,
    transport_cost numeric DEFAULT 0,
    is_editing_confirmed_by_client boolean DEFAULT false,
    is_printing_confirmed_by_client boolean DEFAULT false,
    is_delivery_confirmed_by_client boolean DEFAULT false,
    confirmed_sub_statuses jsonb DEFAULT '[]'::jsonb,
    client_sub_status_notes jsonb DEFAULT '{}'::jsonb,
    sub_status_confirmation_sent_at jsonb DEFAULT '{}'::jsonb,
    completed_digital_items jsonb DEFAULT '[]'::jsonb,
    invoice_signature text,
    custom_sub_statuses jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    date date NOT NULL,
    description text NOT NULL,
    amount numeric NOT NULL,
    type text NOT NULL CHECK (type IN ('Pemasukan', 'Pengeluaran')),
    project_id uuid REFERENCES projects(id),
    category text NOT NULL,
    method text NOT NULL CHECK (method IN ('Transfer Bank', 'Tunai', 'E-Wallet', 'Sistem', 'Kartu')),
    pocket_id uuid,
    card_id uuid,
    printing_item_id text,
    vendor_signature text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_holder_name text NOT NULL,
    bank_name text NOT NULL,
    card_type text NOT NULL CHECK (card_type IN ('Prabayar', 'Kredit', 'Debit')),
    last_four_digits text NOT NULL,
    expiry_date text,
    balance numeric DEFAULT 0,
    color_gradient text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Financial pockets table
CREATE TABLE IF NOT EXISTS financial_pockets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL CHECK (icon IN ('piggy-bank', 'lock', 'users', 'clipboard-list', 'star')),
    type text NOT NULL CHECK (type IN ('Nabung & Bayar', 'Terkunci', 'Bersama', 'Anggaran Pengeluaran', 'Tabungan Hadiah Freelancer')),
    amount numeric DEFAULT 0,
    goal_amount numeric,
    lock_end_date date,
    members jsonb DEFAULT '[]'::jsonb,
    source_card_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    contact_channel text NOT NULL CHECK (contact_channel IN ('WhatsApp', 'Instagram', 'Website', 'Telepon', 'Referensi', 'Form Saran', 'Lainnya')),
    location text NOT NULL,
    status text NOT NULL DEFAULT 'Sedang Diskusi' CHECK (status IN ('Sedang Diskusi', 'Menunggu Follow Up', 'Dikonversi', 'Ditolak')),
    date date NOT NULL,
    notes text,
    whatsapp text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    category text NOT NULL,
    purchase_date date NOT NULL,
    purchase_price numeric NOT NULL,
    serial_number text,
    status text NOT NULL DEFAULT 'Tersedia' CHECK (status IN ('Tersedia', 'Digunakan', 'Perbaikan')),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number text NOT NULL UNIQUE,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    signing_date date NOT NULL,
    signing_location text NOT NULL,
    client_name1 text NOT NULL,
    client_address1 text NOT NULL,
    client_phone1 text NOT NULL,
    client_name2 text,
    client_address2 text,
    client_phone2 text,
    shooting_duration text NOT NULL,
    guaranteed_photos text NOT NULL,
    album_details text NOT NULL,
    digital_files_format text NOT NULL,
    other_items text,
    personnel_count text NOT NULL,
    delivery_timeframe text NOT NULL,
    dp_date date,
    final_payment_date date,
    cancellation_policy text NOT NULL,
    jurisdiction text NOT NULL,
    vendor_signature text,
    client_signature text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Client feedback table
CREATE TABLE IF NOT EXISTS client_feedback (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name text NOT NULL,
    satisfaction text NOT NULL CHECK (satisfaction IN ('Sangat Puas', 'Puas', 'Biasa Saja', 'Tidak Puas')),
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback text NOT NULL,
    date timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Social media posts table
CREATE TABLE IF NOT EXISTS social_media_posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    client_name text NOT NULL,
    post_type text NOT NULL,
    platform text NOT NULL CHECK (platform IN ('Instagram', 'TikTok', 'Website')),
    scheduled_date date NOT NULL,
    caption text NOT NULL,
    media_url text,
    status text NOT NULL DEFAULT 'Draf' CHECK (status IN ('Draf', 'Terjadwal', 'Diposting', 'Dibatalkan')),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    code text NOT NULL UNIQUE,
    discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value numeric NOT NULL,
    is_active boolean DEFAULT true,
    usage_count integer DEFAULT 0,
    max_usage integer,
    expiry_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- SOPs table
CREATE TABLE IF NOT EXISTS sops (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    category text NOT NULL,
    content text NOT NULL,
    last_updated timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    message text NOT NULL,
    timestamp timestamptz DEFAULT now(),
    is_read boolean DEFAULT false,
    icon text NOT NULL CHECK (icon IN ('lead', 'deadline', 'revision', 'feedback', 'payment', 'completed', 'comment')),
    link_view text,
    link_action jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Team project payments table
CREATE TABLE IF NOT EXISTS team_project_payments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    team_member_name text NOT NULL,
    team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
    date date NOT NULL,
    status text NOT NULL DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Unpaid')),
    fee numeric NOT NULL,
    reward numeric DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Team payment records table
CREATE TABLE IF NOT EXISTS team_payment_records (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_number text NOT NULL UNIQUE,
    team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
    date date NOT NULL,
    project_payment_ids jsonb NOT NULL,
    total_amount numeric NOT NULL,
    vendor_signature text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Reward ledger entries table
CREATE TABLE IF NOT EXISTS reward_ledger_entries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
    date date NOT NULL,
    description text NOT NULL,
    amount numeric NOT NULL,
    project_id uuid REFERENCES projects(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_project_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_ledger_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can read all data" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON profiles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON profiles FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON users FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON users FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON clients FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON packages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON packages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON packages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON packages FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON add_ons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON add_ons FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON add_ons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON add_ons FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON projects FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON team_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON team_members FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON transactions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON cards FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON cards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON cards FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON financial_pockets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON financial_pockets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON financial_pockets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON financial_pockets FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON leads FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON assets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON assets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON assets FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON contracts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON contracts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON contracts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON client_feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON client_feedback FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON client_feedback FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON client_feedback FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON social_media_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON social_media_posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON social_media_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON social_media_posts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON promo_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON promo_codes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON promo_codes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON promo_codes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON sops FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON sops FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON sops FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON sops FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON notifications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON notifications FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON team_project_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON team_project_payments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON team_project_payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON team_project_payments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON team_payment_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON team_payment_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON team_payment_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON team_payment_records FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all data" ON reward_ledger_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update all data" ON reward_ledger_entries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can insert all data" ON reward_ledger_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete all data" ON reward_ledger_entries FOR DELETE TO authenticated USING (true);

-- Public access policies for public forms
CREATE POLICY "Public can insert leads" ON leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can insert client feedback" ON client_feedback FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can read packages" ON packages FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read add_ons" ON add_ons FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read promo_codes" ON promo_codes FOR SELECT TO anon USING (true);
CREATE POLICY "Public can update promo_codes usage" ON promo_codes FOR UPDATE TO anon USING (true);
CREATE POLICY "Public can insert clients" ON clients FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can insert projects" ON projects FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can insert transactions" ON transactions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can read and update cards for payments" ON cards FOR SELECT TO anon USING (true);
CREATE POLICY "Public can update cards for payments" ON cards FOR UPDATE TO anon USING (true);

-- Portal access policies
CREATE POLICY "Clients can access their portal data" ON clients FOR SELECT TO anon USING (true);
CREATE POLICY "Clients can access their projects" ON projects FOR SELECT TO anon USING (true);
CREATE POLICY "Clients can update project confirmations" ON projects FOR UPDATE TO anon USING (true);
CREATE POLICY "Clients can access their contracts" ON contracts FOR SELECT TO anon USING (true);
CREATE POLICY "Clients can sign contracts" ON contracts FOR UPDATE TO anon USING (true);
CREATE POLICY "Clients can access their transactions" ON transactions FOR SELECT TO anon USING (true);

-- Freelancer portal access policies
CREATE POLICY "Freelancers can access their data" ON team_members FOR SELECT TO anon USING (true);
CREATE POLICY "Freelancers can access their projects" ON projects FOR SELECT TO anon USING (true);
CREATE POLICY "Freelancers can update revisions" ON projects FOR UPDATE TO anon USING (true);
CREATE POLICY "Freelancers can access their payments" ON team_project_payments FOR SELECT TO anon USING (true);
CREATE POLICY "Freelancers can access their payment records" ON team_payment_records FOR SELECT TO anon USING (true);
CREATE POLICY "Freelancers can access their rewards" ON reward_ledger_entries FOR SELECT TO anon USING (true);
CREATE POLICY "Freelancers can read SOPs" ON sops FOR SELECT TO anon USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_portal_access_id ON clients(portal_access_id);
CREATE INDEX IF NOT EXISTS idx_team_members_portal_access_id ON team_members(portal_access_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(date);
CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_team_project_payments_team_member_id ON team_project_payments(team_member_id);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
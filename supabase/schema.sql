-- AutoTransportPro - Leads Table Schema
-- Run this in your Supabase SQL Editor

-- Create the leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  origin_zip text NOT NULL,
  destination_zip text NOT NULL,
  vehicle_make text NOT NULL,
  vehicle_model text NOT NULL,
  vehicle_year integer NOT NULL,
  transport_type text NOT NULL CHECK (transport_type IN ('Open', 'Enclosed')),
  vehicle_condition text NOT NULL CHECK (vehicle_condition IN ('Running', 'Non-Running')),
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Quoted', 'Booked', 'Lost')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Service role (server-side API) has full access
CREATE POLICY "Service role full access" ON leads
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Authenticated brokers can read all leads
CREATE POLICY "Brokers can read leads" ON leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Authenticated brokers can update lead status
CREATE POLICY "Brokers can update leads" ON leads
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Index for faster status filtering
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);

-- Sample data (optional - remove in production)
INSERT INTO leads (name, email, phone, origin_zip, destination_zip, vehicle_make, vehicle_model, vehicle_year, transport_type, vehicle_condition, status) VALUES
  ('John Smith', 'john.smith@example.com', '(555) 123-4567', '90210', '10001', 'Toyota', 'Camry', 2022, 'Open', 'Running', 'New'),
  ('Sarah Johnson', 'sarah.j@example.com', '(555) 987-6543', '77001', '33101', 'Ford', 'F-150', 2020, 'Open', 'Running', 'Contacted'),
  ('Michael Davis', 'mdavis@example.com', '(555) 456-7890', '60601', '85001', 'Ferrari', '488', 2021, 'Enclosed', 'Running', 'Quoted'),
  ('Emily Wilson', 'ewilson@example.com', '(555) 321-0987', '98101', '30301', 'Tesla', 'Model 3', 2023, 'Open', 'Running', 'Booked'),
  ('Robert Brown', 'rbrown@example.com', '(555) 654-3210', '19104', '94102', 'BMW', 'X5', 2019, 'Enclosed', 'Non-Running', 'Lost');

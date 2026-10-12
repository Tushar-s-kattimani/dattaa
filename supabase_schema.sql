-- Supabase Schema for Shop Contact Manager

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location_name TEXT NOT NULL,
  district TEXT,
  taluk TEXT,
  area TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shops table
CREATE TABLE IF NOT EXISTS shops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_name TEXT NOT NULL,
  contact_person TEXT,
  mobile_number TEXT NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  full_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for the scope of this app (for ease of use as requested, or we can use authenticated access if authentication is implemented)
-- Note: In a production app, you'd want to use authenticated users. We are creating policies to allow all operations for this demo.
CREATE POLICY "Allow public select on locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on locations" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on locations" ON locations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on locations" ON locations FOR DELETE USING (true);

CREATE POLICY "Allow public select on shops" ON shops FOR SELECT USING (true);
CREATE POLICY "Allow public insert on shops" ON shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on shops" ON shops FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on shops" ON shops FOR DELETE USING (true);

-- Functions and Triggers
-- Update updated_at column on shops table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shops_updated_at
BEFORE UPDATE ON shops
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

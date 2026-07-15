-- SUPABASE BACKEND SCHEMA FOR NARAYAN CONSULTING WEBSITE
-- Copy and execute this SQL statement inside the Supabase SQL Editor.

-- 1. Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  project_id TEXT,
  project_status TEXT DEFAULT 'Project Received',
  progress INTEGER DEFAULT 0,
  current_work TEXT DEFAULT 'Project review and initial setup.',
  estimated_delivery TEXT DEFAULT 'TBD',
  developer_notes TEXT DEFAULT ''
);

-- For users who already have the appointments table, run these SQL statements to add tracking columns:
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS project_id TEXT;
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS project_status TEXT DEFAULT 'Project Received';
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS current_work TEXT DEFAULT 'Project review and initial setup.';
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS estimated_delivery TEXT DEFAULT 'TBD';
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS developer_notes TEXT DEFAULT '';

-- 2. Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Note: The Express backend will automatically register the default admin 'admin'
-- with password 'admin_secure_password' (hashed using bcrypt) upon start-up 
-- if the admins table is empty. You do not need to manually compute the hash.

-- Enable Read-Write Access on tables (Make sure RLS is configured or bypassed using service_role token)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create Policies for appointments (if using anon / authenticated roles directly)
-- Note: The Node.js server connects using the secret SUPABASE_SERVICE_ROLE_KEY, which 
-- automatically bypasses Row Level Security (RLS) rules for secure backend management.
-- If you want direct frontend integration, you can use these policies:

CREATE POLICY "Allow public insert of appointments" 
  ON appointments FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow admin role read/write of appointments" 
  ON appointments FOR ALL 
  USING (true);

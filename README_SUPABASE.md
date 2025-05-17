# Supabase Setup for Tourist Management System

This guide will help you set up Supabase as the database for your Tourist Management System.

## Prerequisites

1. A Supabase account (free tier is sufficient)
2. Your Supabase project credentials:
   - DATABASE_URL
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

## Manual Setup in Supabase SQL Editor (Recommended)

Since automatic setup methods may encounter issues in Replit's environment, the most reliable way to set up the database is through Supabase's SQL Editor:

1. Log in to your Supabase account at https://app.supabase.com/
2. Navigate to your project
3. Go to the SQL Editor in the left sidebar
4. Create a new query
5. Copy and paste the following SQL script:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    num_adults INTEGER NOT NULL,
    contact_email VARCHAR(120) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Create travelers table
CREATE TABLE IF NOT EXISTS travelers (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL
);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for destinations table
CREATE OR REPLACE TRIGGER update_destinations_updated_at
BEFORE UPDATE ON destinations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert admin user
INSERT INTO users (username, email, password_hash, is_admin)
VALUES ('admin', 'admin@touristmanager.com', 'pbkdf2:sha256:600000$0L3dDcUX0GECEtC9$8a06ca2b98fd61f97f7d74b8db9fd1f3fdccb1d6c1c6fdf2f83b8791d4f97c62', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Insert sample destinations
INSERT INTO destinations (name, description, image_url, price)
VALUES 
    ('Bali, Indonesia', 'Tropical paradise with beautiful beaches, lush rice terraces, and vibrant cultural experiences.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fGJhbGl8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60', 75000),
    ('Venice, Italy', 'Romantic city built on canals, famous for its stunning architecture and gondola rides.', 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dmVuaWNlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60', 125000),
    ('Santorini, Greece', 'Stunning island with white-washed buildings, blue domes, and breathtaking sunset views.', 'https://images.unsplash.com/photo-1551201675-a7b7a54be9fc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8c2FudG9yaW5pfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60', 95000)
ON CONFLICT (id) DO NOTHING;
```

6. Click "Run" to execute the script and create all the tables

## Environment Variables in .env

Make sure your .env file contains these variables:

```
# Supabase Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.example.supabase.co:5432/postgres
SUPABASE_URL=https://example.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SESSION_SECRET=your-super-secret-key-for-flask-sessions
```

Replace the placeholders with your actual Supabase credentials.

## Alternative Automated Methods

We've provided several scripts to try to automate the setup process, but they may encounter connectivity issues:

```bash
# Try REST API method
python create_tables_rest.py

# Try direct PostgreSQL connection
python create_supabase_tables.py

# The original setup utility
python setup_db.py
```

## Troubleshooting

If you're still seeing "System is running in local database mode":

1. Verify you've created all the required tables in Supabase, especially the `destinations` table
2. Check that your .env file contains the correct credentials
3. Restart the application after setting up the tables and environment variables

Remember that direct PostgreSQL connections from Replit to Supabase may sometimes fail due to network limitations, but the REST API connection should work.
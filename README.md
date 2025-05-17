# Tourist Management System

A visually stunning Tourist Management System with user and admin functionalities, built with Flask, Vanilla JS, and Supabase.

## Features

- Beautiful, responsive UI with unique design elements
- User authentication (signup, login, profile management)
- Destination browsing and filtering
- Booking system with multi-step process
- Admin panel for destination management
- Secure payment processing
- Database persistence with Supabase

## Setup Instructions

### 1. Supabase Database Setup

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project
3. Get your database connection string:
   - Go to the Supabase dashboard
   - Navigate to Project Settings > Database
   - Find the "Connection string" section and copy the URI value (replace `[YOUR-PASSWORD]` with your database password)
4. Run the database setup script:
   - In the Supabase dashboard, go to the SQL Editor
   - Copy the contents of the `supabase_schema.sql` file from this project
   - Paste into the SQL Editor and run the query to create all tables and seed data

### 2. Environment Setup

Create the following environment variables:
- `DATABASE_URL`: Your Supabase connection string
- `SESSION_SECRET`: A secure random string for session encryption

### 3. Running the Application

```
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
```

## Project Structure

- `app.py` - Flask application setup and database connection
- `main.py` - Application entry point
- `models.py` - Database models
- `routes.py` - Application routes and API endpoints
- `supabase.py` - Supabase database connection utilities
- `templates/` - HTML templates
- `static/` - CSS, JavaScript, and media files

## Admin Access

- Default admin credentials:
  - Username: admin
  - Password: admin123
- Access admin panel at `/admin/login`

## License

MIT
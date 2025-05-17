# 🌍✨ Tourist Management System ✨🧳

A visually stunning **Tourist Management System** with user and admin functionalities, built with **Flask**, **Vanilla JS**, and **Supabase**.

---

## 🚀 Features

- 🎨 **Beautiful, responsive UI** with unique design elements  
- 🔐 **User authentication** (signup, login, profile management)  
- 🏖️ **Destination browsing** and intelligent filtering  
- 📅 **Booking system** with a multi-step process  
- 🛠️ **Admin panel** for managing destinations  
- 💳 **Secure payment processing**  
- 🗄️ **Database persistence** with Supabase  

---
Visit Now -- https://world-travel-qyph.onrender.com/
---

## ⚙️ Setup Instructions

### 1️⃣ Supabase Database Setup

1. 🧾 Create a Supabase account at [supabase.com](https://supabase.com)  
2. 🏗️ Create a new Supabase project  
3. 🔗 Get your database connection string:
   - Go to the Supabase dashboard  
   - Navigate to **Project Settings > Database**  
   - Find the **Connection string** section and copy the URI (replace `[YOUR-PASSWORD]` with your database password)  
4. 📤 Run the database setup script:
   - In the Supabase dashboard, go to the **SQL Editor**  
   - Copy contents of `supabase_schema.sql`  
   - Paste and execute to create tables and seed data  

---

### 2️⃣ Environment Setup

Set the following environment variables:

- `DATABASE_URL`: Your Supabase connection string  
- `SESSION_SECRET`: A secure random string for session encryption 🔐  

---

### 3️⃣ Running the Application

```bash
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
🗂️ Project Structure
app.py - 🧠 Flask app setup and DB connection

main.py - 🚪 Application entry point

models.py - 🧾 Database models

routes.py - 🚦 Routes and API endpoints

supabase.py - 🔌 Supabase connection utilities

templates/ - 🖼️ HTML templates

static/ - 🎨 CSS, JS, and media files

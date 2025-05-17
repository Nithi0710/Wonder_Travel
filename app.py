import os
import logging
from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_cors import CORS
from flask_session import Session
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional, Dict
from functools import wraps
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY") or "super-secret-key"
app.debug = True  

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)

SUPABASE_URL = "https://svvkilolzxoeerjmezcl.supabase.co"
SUPABASE_ANON_KEY = "your-supabase-key"

# Flask app setup
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY") or "super-secret-key"
CORS(app)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Supabase client class
class SupabaseClient:
    def __init__(self, url=None, key=None):
        self.url = url or os.getenv("SUPABASE_URL")
        self.key = key or os.getenv("SUPABASE_ANON_KEY")

        if not self.url or not self.key:
            logging.error("SUPABASE_URL or SUPABASE_ANON_KEY environment variables are not set")
            raise ValueError("Supabase credentials missing")

        self.supabase = create_client(self.url, self.key)
        logging.info(f"Supabase client initialized with URL: {self.url}")

    def query_table(self, table_name: str, select: str = "*", filters: Optional[Dict] = None, limit: Optional[int] = None):
        query = self.supabase.table(table_name).select(select)
        if filters:
            for column, value in filters.items():
                query = query.eq(column, value)
        if limit:
            query = query.limit(limit)
        try:
            response = query.execute()
            return response.data
        except Exception as e:
            logging.error(f"Error executing query on table {table_name}: {str(e)}")
            return None

    def insert(self, table_name: str, data: dict):
        try:
            response = self.supabase.table(table_name).insert(data).execute()
            return response.data
        except Exception as e:
            logging.error(f"Error during insert operation: {str(e)}")
            return None

    def update(self, table_name: str, data: dict, filters: dict):
        try:
            response = self.supabase.table(table_name).update(data).match(filters).execute()
            return response.data
        except Exception as e:
            logging.error(f"Error during update operation: {str(e)}")
            return None

# Supabase setup
SUPABASE_ENABLED = False
SUPABASE_CONNECTION_ERROR = None
supabase_client = None

try:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_key:
        raise ValueError("Missing Supabase credentials")

    supabase_client = SupabaseClient(supabase_url, supabase_key)
    if not supabase_client.query_table("destinations", select="*"):
        raise ConnectionError("Unable to access Supabase table.")
    
    SUPABASE_ENABLED = True
    logging.info("Connected to Supabase.")
except Exception as e:
    SUPABASE_CONNECTION_ERROR = str(e)
    logging.error(f"Supabase connection error: {SUPABASE_CONNECTION_ERROR}")

# Inject Supabase status into templates
@app.context_processor
def inject_db_status():
    return {
        "supabase_enabled": SUPABASE_ENABLED,
        "supabase_error": SUPABASE_CONNECTION_ERROR
    }

@app.context_processor
def inject_user():
    return {
        "is_logged_in": "user_id" in session
    }

# Login-required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            flash("Please log in to access this page.", "warning")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route("/")
def index():
    if not SUPABASE_ENABLED:
        flash("Supabase not available. Showing sample data.", "warning")
        return render_template("index.html", destinations=[])
    try:
        destinations = supabase_client.query_table("destinations", select="id, name, description, image_url, price", limit=10)
        return render_template("index.html", destinations=destinations)
    except Exception as e:
        flash("Error loading destinations.", "danger")
        logging.error(f"Index load error: {str(e)}")
        return render_template("index.html", destinations=[])

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/help")
def help_page():
    return render_template("help.html")

from datetime import datetime

@app.route("/dashboard")
@login_required
def dashboard():
    user_id = session.get("user_id")
    username = session.get("username", "Traveler")

    bookings = supabase_client.query_table("bookings", filters={"user_id": user_id}) or []
    for b in bookings:
        dest = supabase_client.query_table("destinations", filters={"id": b["destination_id"]})
        b["destination"] = dest[0] if dest else None

    return render_template("dashboard.html", username=username, bookings=bookings)


import json

@app.route("/booking/<int:destination_id>", methods=["GET", "POST"])
@login_required
def booking(destination_id):
    destination_data = supabase_client.query_table("destinations", filters={"id": destination_id})
    if not destination_data:
        return "Destination not found", 404
    destination = destination_data[0]

    if request.method == "POST":
        try:
            num_adults = int(request.form.get("num-adults"))
            start_date = request.form.get("start-date")
            end_date = request.form.get("end-date")
            contact_email = request.form.get("contact-email")
            contact_phone = request.form.get("contact-phone")
            travelers_json = request.form.get("travelers_json")
            travelers = json.loads(travelers_json) if travelers_json else []

            total_price = destination["price"] * num_adults

            booking_data = {
                "user_id": session["user_id"],
                "destination_id": destination_id,
                "start_date": start_date,
                "end_date": end_date,
                "num_adults": num_adults,
                "contact_email": contact_email,
                "contact_phone": contact_phone,
                "total_price": total_price,
                "payment_status": "success"
            }

            # Insert booking
            result = supabase_client.insert("bookings", booking_data)

            if result:
                booking_id = result[0]["id"]

                # Insert each traveler
                for traveler in travelers:
                    traveler_data = {
                        "booking_id": booking_id,
                        "name": traveler.get("name"),
                        "age": traveler.get("age")
                    }
                    supabase_client.insert("travelers", traveler_data)

                return redirect(url_for("success", booking_id=booking_id))
            else:
                flash("Booking failed. Please check server logs.", "danger")

        except Exception as e:
            import traceback
            return f"<pre>Exception:\n{traceback.format_exc()}</pre>"

    return render_template("booking.html", destination=destination)


# Booking.js - Handles the booking process





@app.route("/success")
@login_required
def success():
    booking_id = request.args.get("booking_id")
    if not booking_id:
        flash("Missing booking ID.", "danger")
        return redirect(url_for("dashboard"))

    booking_data = supabase_client.query_table("bookings", filters={"id": int(booking_id)})
    if not booking_data:
        flash("Booking not found.", "danger")
        return redirect(url_for("dashboard"))
    booking = booking_data[0]

    destination_data = supabase_client.query_table("destinations", filters={"id": booking["destination_id"]})
    if not destination_data:
        flash("Destination not found.", "danger")
        return redirect(url_for("dashboard"))
    destination = destination_data[0]

    return render_template("success.html", booking=booking, destination=destination)


@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")  # Adding email
        password = request.form.get("password")
        
        if not username or not email or not password:
            flash("Username, email, and password are required.", "warning")
            return render_template("signup.html")
        
        if len(password) < 6:
            flash("Password must be at least 6 characters long.", "warning")
            return render_template("signup.html")
        
        # Hash the password before storing it
        password_hash = password

        # Insert into Supabase
        result = supabase_client.insert("users", {
            "username": username,
            "email": email,  # Storing email as well
            "password_hash": password_hash
        })
        
        if result:
            flash("Signup successful! Please login.", "success")
            return redirect(url_for("login"))
        else:
            flash("Signup failed. Try again later.", "danger")
    return render_template("signup.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        try:
            response = supabase_client.supabase.table("users").select("id, username, password_hash").eq("username", username).single().execute()
            if response.data:
                if password == response.data["password_hash"]:
                    session["user_id"] = response.data["id"]
                    session["username"] = username
                    flash("Login successful!", "success")
                    return redirect(url_for("dashboard"))
                else:
                    flash("Incorrect password.", "danger")
            else:
                flash("User not found.", "danger")
        except Exception as e:
            logging.error(f"Login error: {str(e)}")
            flash("Login failed. Try again later.", "danger")
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    flash("Logged out successfully.", "info")
    return redirect(url_for("index"))

@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)

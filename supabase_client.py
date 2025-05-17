import os
import logging
from supabase import create_client, Client
from typing import Optional, Dict

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

    def update(self, table_name: str, data: dict, filters: Dict):
        try:
            query = self.supabase.table(table_name).update(data)
            for column, value in filters.items():
                query = query.eq(column, value)
            response = query.execute()
            return True
        except Exception as e:
            logging.error(f"Error updating table {table_name}: {str(e)}")
            return False

    def delete(self, table_name: str, filters: Dict):
        try:
            query = self.supabase.table(table_name).delete()
            for column, value in filters.items():
                query = query.eq(column, value)
            response = query.execute()
            return True
        except Exception as e:
            logging.error(f"Error deleting from table {table_name}: {str(e)}")
            return False


# # Example of how to use the SupabaseClient
# supabase_client = SupabaseClient()

# # Query a table
# data = supabase_client.query_table("users", select="id, username", limit=10)
# if data:
#     print(data)

# # Insert data into a table
# new_user = {
#     "username": "john_doe",  # Make sure to use the correct column names
#     "email": "john@example.com",
#     "password_hash": "securepassword"
# }
# inserted_data = supabase_client.insert("users", new_user)
# if inserted_data:
#     print("User inserted successfully:", inserted_data)
# else:
#     print("Error inserting user.")


# # Update data in a table
# update_data = {"email": "john_updated@example.com"}
# filters = {"id": 1}
# update_success = supabase_client.update("users", update_data, filters)
# if update_success:
#     print("Update successful")

# # Delete data from a table
# delete_success = supabase_client.delete("users", filters)
# if delete_success:
#     print("Delete successful")

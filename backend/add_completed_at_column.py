"""
Script to add completed_at column to tasks table
"""
import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def add_completed_at_column():
    """Add completed_at column to tasks table"""
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Add the completed_at column using raw SQL
        sql = """
        ALTER TABLE tasks 
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
        """
        
        print("Adding completed_at column to tasks table...")
        
        # Execute the SQL
        result = supabase.rpc('exec_sql', {'sql': sql})
        
        print("✅ completed_at column added successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error adding completed_at column: {e}")
        return False

if __name__ == "__main__":
    success = add_completed_at_column()
    sys.exit(0 if success else 1)

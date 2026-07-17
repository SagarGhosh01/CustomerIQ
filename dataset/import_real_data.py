import os
import csv
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database", "customer.db")
ML_TRAIN_SCRIPT = os.path.join(BASE_DIR, "ml", "train_model.py")

def import_online_retail(csv_path):
    """
    Imports Kaggle's Online Retail Dataset.
    Columns: InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice, CustomerID, Country
    """
    print(f"Detecting 'Online Retail' dataset from {csv_path}...")
    df = pd.read_csv(csv_path, encoding="ISO-8859-1")
    
    # Clean data
    df = df.dropna(subset=['CustomerID', 'Description'])
    df['CustomerID'] = df['CustomerID'].astype(int)
    df['Quantity'] = df['Quantity'].astype(int)
    df['UnitPrice'] = df['UnitPrice'].astype(float)
    df = df[(df['Quantity'] > 0) & (df['UnitPrice'] > 0)]
    
    # Limit to top 300 customers to keep database smooth for demo
    unique_custs = df['CustomerID'].unique()
    if len(unique_custs) > 300:
        print(f"Limiting import to top 300 customers for demo efficiency...")
        top_custs = df.groupby('CustomerID')['InvoiceNo'].nunique().nlargest(300).index
        df = df[df['CustomerID'].isin(top_custs)]
        unique_custs = top_custs
        
    print(f"Processing {len(df)} transactions for {len(unique_custs)} customers...")
    
    # Generate Customer profiles
    cities = ["New York", "Los Angeles", "Chicago", "London", "Paris", "Berlin", "Tokyo", "Sydney"]
    genders = ["Male", "Female", "Non-binary"]
    names = ["John Smith", "Jane Doe", "Robert Brown", "Emily Davis", "Michael Miller", "Sarah Wilson", "David Moore", "Jessica Taylor"]
    
    customers_data = []
    for idx, c_id in enumerate(unique_custs):
        cust_name = f"{names[idx % len(names)].split()[0]} {c_id}" # e.g. John 17850
        gender = genders[idx % len(genders)]
        age = int(22 + (c_id % 45)) # Deterministic age mapping
        email = f"customer.{c_id}@example.com"
        city = cities[c_id % len(cities)]
        
        # Calculate random join date (approx 1 year before their first purchase date)
        c_df = df[df['CustomerID'] == c_id]
        try:
            first_purchase = pd.to_datetime(c_df['InvoiceDate']).min()
            join_date = (first_purchase - timedelta(days=90)).strftime("%Y-%m-%d")
        except Exception:
            join_date = "2025-01-01"
            
        customers_data.append((c_id, cust_name, age, gender, email, city, join_date))
        
    # Generate Orders data
    orders_data = []
    order_id_counter = 1
    
    # Map item categories based on description terms
    def get_category(desc):
        desc = str(desc).lower()
        if any(term in desc for term in ["bag", "apparel", "shirt", "coat", "scarf", "glove"]):
            return "Apparel"
        elif any(term in desc for term in ["book", "paper", "notebook", "calendar"]):
            return "Books"
        elif any(term in desc for term in ["light", "clock", "kitchen", "holder", "box", "mug"]):
            return "Home"
        else:
            return "Electronics"
            
    for idx, row in df.iterrows():
        c_id = int(row['CustomerID'])
        product = str(row['Description']).strip()
        category = get_category(product)
        price = float(row['UnitPrice'])
        qty = int(row['Quantity'])
        
        try:
            o_date = pd.to_datetime(row['InvoiceDate']).strftime("%Y-%m-%d")
        except Exception:
            o_date = "2025-06-01"
            
        orders_data.append((order_id_counter, c_id, product, category, price, qty, o_date))
        order_id_counter += 1

    # Insert into Database
    save_to_db(customers_data, orders_data, [])

def import_mall_segmentation(csv_path):
    """
    Imports Kaggle's Mall Customer Segmentation Dataset.
    Columns: CustomerID, Gender, Age, Annual Income (k$), Spending Score (1-100)
    """
    print(f"Detecting 'Mall Customer Segmentation' dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    customers_data = []
    orders_data = []
    
    # Pre-defined lists for generating purchase histories
    products = {
        "Electronics": [("Wireless Mouse", 29.99), ("Noise Cancelling Headphones", 199.99)],
        "Apparel": [("Leather Backpack", 79.99), ("Running Shoes", 65.00)],
        "Home": [("Ergonomic Chair", 189.99), ("Coffee Maker", 49.99)],
        "Books": [("Python Programming Guide", 34.99), ("Sci-Fi Novel: The Stars", 14.99)]
    }
    
    order_id = 1
    for idx, row in df.iterrows():
        c_id = int(row['CustomerID'])
        gender = str(row['Gender'])
        age = int(row['Age'])
        income = float(row['Annual Income (k$)'])
        spending_score = float(row['Spending Score (1-100)'])
        
        name = f"Customer {c_id}"
        email = f"mall.{c_id}@example.com"
        city = "Mall District"
        join_date = (datetime(2025, 1, 1) + timedelta(days=c_id % 300)).strftime("%Y-%m-%d")
        
        customers_data.append((c_id, name, age, gender, email, city, join_date))
        
        # Generate purchases matching their spending score
        # High score -> more purchases
        num_purchases = int(1 + (spending_score / 15))
        for p_idx in range(num_purchases):
            cat = list(products.keys())[(c_id + p_idx) % 4]
            prod, price = products[cat][p_idx % 2]
            
            # Map price scale slightly by income
            price_scaled = price * (0.8 + (income / 150))
            qty = int(1 + (spending_score % 3))
            o_date = (datetime(2025, 7, 1) + timedelta(days=p_idx * 15)).strftime("%Y-%m-%d")
            
            orders_data.append((order_id, c_id, prod, cat, round(price_scaled, 2), qty, o_date))
            order_id += 1

    save_to_db(customers_data, orders_data, [])

def save_to_db(customers, orders, reviews):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Re-create tables
    cursor.execute("DROP TABLE IF EXISTS customers")
    cursor.execute("DROP TABLE IF EXISTS orders")
    cursor.execute("DROP TABLE IF EXISTS reviews")
    
    cursor.execute("""
    CREATE TABLE customers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        age INTEGER,
        gender TEXT,
        email TEXT UNIQUE,
        city TEXT,
        join_date DATE,
        segment TEXT DEFAULT 'New',
        churn_probability REAL DEFAULT 0.0,
        churn_risk TEXT DEFAULT 'Low',
        predicted_clv REAL DEFAULT 0.0,
        avg_sentiment REAL DEFAULT 0.0
    );
    """)
    cursor.execute("""
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        product TEXT,
        category TEXT,
        price REAL,
        quantity INTEGER,
        date DATE
    );
    """)
    cursor.execute("""
    CREATE TABLE reviews (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        rating INTEGER,
        comment TEXT,
        sentiment_score REAL,
        sentiment_label TEXT,
        date DATE
    );
    """)
    
    # Batch Insert
    print("Inserting data into database tables...")
    cursor.executemany("INSERT INTO customers (id, name, age, gender, email, city, join_date) VALUES (?,?,?,?,?,?,?)", customers)
    cursor.executemany("INSERT INTO orders (id, customer_id, product, category, price, quantity, date) VALUES (?,?,?,?,?,?,?)", orders)
    if reviews:
        cursor.executemany("INSERT INTO reviews (id, customer_id, rating, comment, sentiment_score, sentiment_label, date) VALUES (?,?,?,?,?,?,?)", reviews)
        
    conn.commit()
    conn.close()
    
    print("Import successful! Triggering model retraining...")
    # Retrain model objects to map predictions back to the database
    import subprocess
    subprocess.run(["python", ML_TRAIN_SCRIPT], check=True)
    print("Models retrained successfully on new imported data!")

def detect_and_import(csv_path):
    if not os.path.exists(csv_path):
        print(f"Error: file not found at {csv_path}")
        return
        
    with open(csv_path, 'r', encoding="ISO-8859-1") as f:
        reader = csv.reader(f)
        headers = [h.strip() for h in next(reader)]
        
    print(f"Loaded headers: {headers}")
    
    # Online Retail Check
    if "InvoiceNo" in headers and "CustomerID" in headers:
        import_online_retail(csv_path)
    # Mall Customer Check
    elif "Annual Income (k$)" in headers or "Spending Score (1-100)" in headers:
        import_mall_segmentation(csv_path)
    else:
        # Standard customer format import
        print("Unknown headers. Expecting standard Kaggle dataset files.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python import_real_data.py <path_to_kaggle_csv>")
    else:
        detect_and_import(sys.argv[1])

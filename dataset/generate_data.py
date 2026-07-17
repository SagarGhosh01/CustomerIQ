import os
import csv
import random
from datetime import datetime, timedelta

# Constants for synthetic data generation
CITIES = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"]
GENDERS = ["Male", "Female", "Non-binary"]
NAMES_MALE = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Mark", "Donald"]
NAMES_FEMALE = ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Sandra", "Margaret"]
NAMES_NEUTRAL = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Casey", "Pat", "Robin", "Jamie"]
SURNAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson"]

PRODUCTS = {
    'Electronics': [
        ('Wireless Mouse', 29.99),
        ('Mechanical Keyboard', 89.99),
        ('27" Monitor', 249.99),
        ('Noise Cancelling Headphones', 199.99),
        ('USB-C Hub', 39.99),
        ('Smart Watch', 149.99)
    ],
    'Apparel': [
        ('Leather Backpack', 79.99),
        ('Running Shoes', 65.00),
        ('Denim Jacket', 55.00),
        ('Graphic T-Shirt', 19.99),
        ('Sport Socks (5 pack)', 14.99),
        ('Sunglasses', 24.99)
    ],
    'Home': [
        ('Ergonomic Chair', 189.99),
        ('Smart Thermostat', 129.99),
        ('Coffee Maker', 49.99),
        ('Desk Lamp', 29.99),
        ('Scented Candle', 12.50),
        ('Water Bottle', 18.00)
    ],
    'Books': [
        ('Python Programming Guide', 34.99),
        ('Data Science Handbook', 44.99),
        ('Sci-Fi Novel: The Stars', 14.99),
        ('Mystery Novel: Dark Woods', 12.99),
        ('Business Strategy Guide', 24.99),
        ('History of the World', 18.99)
    ]
}

REVIEW_COMMENTS = {
    5: [
        "Excellent product! Exceeded my expectations.",
        "Very happy with the purchase. High quality and works perfectly.",
        "Fast shipping, great value. Highly recommend!",
        "Amazing service and outstanding quality!",
        "Exactly what I was looking for. Five stars!"
    ],
    4: [
        "Good quality product. Worth the money.",
        "Works well, though delivery took a bit longer than expected.",
        "Very solid build. Would buy again.",
        "Satisfied with this purchase. Minor issues but overall great.",
        "Decent performance, looks nice in my room."
    ],
    3: [
        "It is okay, does the job but nothing special.",
        "Decent product, but I expected more features.",
        "Average quality. You get what you pay for.",
        "It works but has some minor design flaws.",
        "Satisfactory but probably wouldn't recommend it over alternatives."
    ],
    2: [
        "Disappointed. The quality is not very good.",
        "Had issues setting it up. Customer support was unhelpful.",
        "Not worth the price. Underperformed.",
        "Broke after a couple of weeks of light use.",
        "Functional but very cheap materials."
    ],
    1: [
        "Terrible product. Do not buy!",
        "Complete waste of money. Arrived broken.",
        "Worst purchase I've made. Fails to work.",
        "Extremely poor quality. Customer service refused to refund.",
        "Horrible experience, stopped working on day one."
    ]
}

def generate_synthetic_data(num_customers=500, output_dir="dataset"):
    os.makedirs(output_dir, exist_ok=True)
    
    current_time = datetime(2026, 7, 17) # Lock current time context
    
    customers = []
    orders = []
    reviews = []
    
    order_id_counter = 1
    review_id_counter = 1
    
    for i in range(1, num_customers + 1):
        gender = random.choice(GENDERS)
        if gender == "Male":
            name = f"{random.choice(NAMES_MALE)} {random.choice(SURNAMES)}"
        elif gender == "Female":
            name = f"{random.choice(NAMES_FEMALE)} {random.choice(SURNAMES)}"
        else:
            name = f"{random.choice(NAMES_NEUTRAL)} {random.choice(SURNAMES)}"
            
        age = random.randint(18, 70)
        email = f"{name.lower().replace(' ', '.')}.{i}@example.com"
        city = random.choice(CITIES)
        
        # Join date in the last 3 years
        join_days_ago = random.randint(30, 1000)
        join_date = current_time - timedelta(days=join_days_ago)
        
        # Calculate behavioral traits for correlation
        # VIP: high buying frequency, high spending
        # Regular: normal shopping
        # Churning/Inactive: has not purchased recently, or poor rating history
        profile_type = random.choices(["VIP", "Regular", "Risk"], weights=[0.15, 0.70, 0.15], k=1)[0]
        
        # Number of orders based on profile
        if profile_type == "VIP":
            num_orders = random.randint(8, 20)
            avg_rating_range = [4, 5]
        elif profile_type == "Risk":
            num_orders = random.randint(1, 3)
            avg_rating_range = [1, 3]
        else:
            num_orders = random.randint(2, 8)
            avg_rating_range = [3, 5]
            
        customer_orders = []
        customer_reviews = []
        
        # Generate orders
        last_order_date = join_date
        for _ in range(num_orders):
            category = random.choice(list(PRODUCTS.keys()))
            product, price = random.choice(PRODUCTS[category])
            quantity = random.randint(1, 3)
            
            # Order date between join_date and current_time
            # VIPs buy continuously. Risk buyers bought early and stopped.
            if profile_type == "Risk":
                # Orders occurred long ago
                order_date = join_date + timedelta(days=random.randint(0, min(join_days_ago, 180)))
            else:
                order_date = join_date + timedelta(days=random.randint(0, join_days_ago))
                
            if order_date > last_order_date:
                last_order_date = order_date
                
            orders.append({
                "OrderID": order_id_counter,
                "CustomerID": i,
                "Product": product,
                "Category": category,
                "Price": price,
                "Quantity": quantity,
                "Date": order_date.strftime("%Y-%m-%d")
            })
            
            # Review generation (not every order gets a review)
            if random.random() < 0.4:
                rating = random.choice(avg_rating_range)
                if rating in [1, 2] and random.random() < 0.2:
                    rating = 3 # Add noise
                comment = random.choice(REVIEW_COMMENTS[rating])
                
                reviews.append({
                    "ReviewID": review_id_counter,
                    "CustomerID": i,
                    "Rating": rating,
                    "Comment": comment,
                    "Date": (order_date + timedelta(days=random.randint(1, 5))).strftime("%Y-%m-%d")
                })
                review_id_counter += 1
                
            order_id_counter += 1
            
        customers.append({
            "CustomerID": i,
            "Name": name,
            "Age": age,
            "Gender": gender,
            "Email": email,
            "City": city,
            "JoinDate": join_date.strftime("%Y-%m-%d")
        })

    # Write to CSV files
    with open(os.path.join(output_dir, "customers.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["CustomerID", "Name", "Age", "Gender", "Email", "City", "JoinDate"])
        writer.writeheader()
        writer.writerows(customers)
        
    with open(os.path.join(output_dir, "orders.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["OrderID", "CustomerID", "Product", "Category", "Price", "Quantity", "Date"])
        writer.writeheader()
        writer.writerows(orders)
        
    with open(os.path.join(output_dir, "reviews.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["ReviewID", "CustomerID", "Rating", "Comment", "Date"])
        writer.writeheader()
        writer.writerows(reviews)
        
    print(f"Generated {len(customers)} customers, {len(orders)} orders, and {len(reviews)} reviews successfully.")

if __name__ == "__main__":
    generate_synthetic_data()

import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

# Path setups for loading serialized ML artifacts
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ML_DIR = os.path.join(BASE_DIR, "ml")

CHURN_MODEL_PATH = os.path.join(ML_DIR, "churn_model.pkl")
CLV_MODEL_PATH = os.path.join(ML_DIR, "clv_model.pkl")
SCALER_PATH = os.path.join(ML_DIR, "scaler.pkl")

# --- 1. Sentiment Analysis ---
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    vader_analyzer = SentimentIntensityAnalyzer()
except ImportError:
    vader_analyzer = None

# Pure Python Lexicon fallback for maximum resilience
POSITIVE_WORDS = {"great", "good", "excellent", "happy", "love", "perfect", "fast", "best", "satisfied", "amazing", "outstanding", "worth"}
NEGATIVE_WORDS = {"terrible", "bad", "worst", "broken", "waste", "disappointed", "slow", "poor", "horrible", "defect", "fail", "cheap", "refund"}

def analyze_sentiment(comment: str) -> tuple[float, str]:
    """
    Analyzes comment and returns (sentiment_score [-1 to 1], sentiment_label ['Positive', 'Neutral', 'Negative'])
    """
    if not comment or not comment.strip():
        return 0.0, "Neutral"

    if vader_analyzer:
        try:
            scores = vader_analyzer.polarity_scores(comment)
            compound = scores["compound"]
            if compound >= 0.05:
                label = "Positive"
            elif compound <= -0.05:
                label = "Negative"
            else:
                label = "Neutral"
            return float(compound), label
        except Exception:
            pass
            
    # Lexicon fallback
    words = comment.lower().split()
    pos_count = sum(1 for w in words if any(p in w for p in POSITIVE_WORDS))
    neg_count = sum(1 for w in words if any(n in w for n in NEGATIVE_WORDS))
    
    total = pos_count + neg_count
    if total == 0:
        return 0.0, "Neutral"
        
    score = (pos_count - neg_count) / total
    
    if score >= 0.1:
        return score, "Positive"
    elif score <= -0.1:
        return score, "Negative"
    else:
        return 0.0, "Neutral"


# --- 2. Machine Learning Predictions & Fallbacks ---

def get_rfm_metrics(customer, current_time=datetime(2026, 7, 17)):
    """Computes Recency, Frequency, Monetary value for a customer"""
    orders = customer.orders
    reviews = customer.reviews
    
    if not orders:
        # Defaults for brand new customers
        join_date = datetime.combine(customer.join_date, datetime.min.time())
        recency = (current_time - join_date).days
        return recency, 0, 0.0, 3.0 # Days, orders, spent, neutral rating
        
    order_dates = [datetime.combine(o.date, datetime.min.time()) for o in orders]
    last_order_date = max(order_dates)
    recency = (current_time - last_order_date).days
    
    frequency = len(orders)
    monetary = sum([o.price * o.quantity for o in orders])
    
    avg_rating = 3.0
    if reviews:
        avg_rating = sum([r.rating for r in reviews]) / len(reviews)
        
    return recency, frequency, monetary, avg_rating

def predict_churn(customer, db_session=None) -> tuple[float, str]:
    """
    Predicts customer churn probability and label.
    Uses serialized ML model if available, otherwise runs robust heuristics.
    """
    recency, frequency, monetary, avg_rating = get_rfm_metrics(customer)
    
    if os.path.exists(CHURN_MODEL_PATH) and os.path.exists(SCALER_PATH):
        try:
            model = joblib.load(CHURN_MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            
            # Feature ordering must match training: [Age, Recency, Frequency, Monetary, AvgRating]
            features = np.array([[customer.age, recency, frequency, monetary, avg_rating]])
            scaled_features = scaler.transform(features)
            
            prob = float(model.predict_proba(scaled_features)[0][1])
            
            if prob >= 0.7:
                risk = "High"
            elif prob >= 0.3:
                risk = "Medium"
            else:
                risk = "Low"
            return prob, risk
        except Exception as e:
            # Silently log/ignore and use fallback
            print(f"ML Churn Prediction Error: {e}. Running fallback heuristics.")
            
    # Heuristic Churn Predictor (correlated with generation parameters)
    # High recency (hasn't bought in > 180 days) is a major indicator
    # Poor review ratings is another indicator
    score = 0.15 # Baseline probability
    
    if recency > 180:
        score += 0.45
    elif recency > 90:
        score += 0.20
        
    if avg_rating < 2.5:
        score += 0.30
    elif avg_rating < 3.5:
        score += 0.10
        
    if frequency <= 2:
        score += 0.10
        
    # Cap between 0.05 and 0.95
    prob = float(np.clip(score, 0.05, 0.95))
    
    if prob >= 0.7:
        risk = "High"
    elif prob >= 0.3:
        risk = "Medium"
    else:
        risk = "Low"
        
    return prob, risk

def predict_clv(customer) -> float:
    """
    Predicts Customer Lifetime Value (next 12 months spending).
    """
    recency, frequency, monetary, avg_rating = get_rfm_metrics(customer)
    
    if os.path.exists(CLV_MODEL_PATH) and os.path.exists(SCALER_PATH):
        try:
            model = joblib.load(CLV_MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            
            features = np.array([[customer.age, recency, frequency, monetary, avg_rating]])
            scaled_features = scaler.transform(features)
            
            predicted_spent = float(model.predict(scaled_features)[0])
            return max(0.0, round(predicted_spent, 2))
        except Exception as e:
            print(f"ML CLV Prediction Error: {e}. Running fallback heuristics.")
            
    # Heuristic CLV Predictor (12 months forward prediction)
    # VIPs spend more, high frequency spend more, low ratings buy less in future
    if frequency == 0:
        return 50.0 # Standard customer base
        
    multiplier = 1.1 # Default growth
    if avg_rating >= 4.0:
        multiplier = 1.3
    elif avg_rating <= 2.0:
        multiplier = 0.4
        
    # CLV is based on yearly spending rate
    days_member = max(10, (datetime(2026, 7, 17) - datetime.combine(customer.join_date, datetime.min.time())).days)
    yearly_spend = (monetary / days_member) * 365.25
    
    clv = yearly_spend * multiplier
    return float(max(20.0, round(clv, 2)))


# --- 3. Product Recommendations ---

RECOMMENDATION_RULES = {
    "Wireless Mouse": ["Mechanical Keyboard", "USB-C Hub", "27\" Monitor"],
    "Mechanical Keyboard": ["Wireless Mouse", "USB-C Hub", "Noise Cancelling Headphones"],
    "27\" Monitor": ["Wireless Mouse", "Mechanical Keyboard", "USB-C Hub"],
    "Noise Cancelling Headphones": ["Smart Watch", "Wireless Mouse", "Sunglasses"],
    "USB-C Hub": ["27\" Monitor", "Wireless Mouse", "Mechanical Keyboard"],
    "Smart Watch": ["Noise Cancelling Headphones", "Running Shoes", "Water Bottle"],
    
    "Leather Backpack": ["Sunglasses", "Running Shoes", "Water Bottle"],
    "Running Shoes": ["Sport Socks (5 pack)", "Water Bottle", "Smart Watch"],
    "Denim Jacket": ["Graphic T-Shirt", "Sunglasses", "Leather Backpack"],
    "Graphic T-Shirt": ["Denim Jacket", "Sport Socks (5 pack)", "Sunglasses"],
    "Sport Socks (5 pack)": ["Running Shoes", "Graphic T-Shirt", "Water Bottle"],
    
    "Ergonomic Chair": ["Desk Lamp", "Smart Thermostat", "Coffee Maker"],
    "Smart Thermostat": ["Ergonomic Chair", "Desk Lamp", "Coffee Maker"],
    "Coffee Maker": ["Water Bottle", "Ergonomic Chair", "Scented Candle"],
    "Desk Lamp": ["Ergonomic Chair", "Python Programming Guide", "Smart Thermostat"],
    
    "Python Programming Guide": ["Data Science Handbook", "Business Strategy Guide", "Desk Lamp"],
    "Data Science Handbook": ["Python Programming Guide", "Business Strategy Guide", "27\" Monitor"],
    "Business Strategy Guide": ["Python Programming Guide", "Data Science Handbook", "Sci-Fi Novel: The Stars"]
}

DEFAULT_RECOMMENDATIONS = ["Wireless Mouse", "Running Shoes", "Coffee Maker", "Python Programming Guide"]

def get_product_recommendations(customer, db_session) -> list[str]:
    """
    Recommends 3 products based on purchase history.
    Uses rule-based associations and matches popular categories.
    """
    orders = customer.orders
    if not orders:
        # Fallback to popular products
        return DEFAULT_RECOMMENDATIONS[:3]
        
    # Get last purchased products
    purchased_items = [o.product for o in orders]
    last_purchased = purchased_items[-1]
    
    # 1. Try exact matching from rules
    recs = RECOMMENDATION_RULES.get(last_purchased, [])
    
    # 2. Filter out products already bought by this customer if possible
    filtered_recs = [r for r in recs if r not in purchased_items]
    
    # If filtered list is too small, use original rules or global popular items in preferred category
    if len(filtered_recs) < 3:
        for r in recs:
            if r not in filtered_recs:
                filtered_recs.append(r)
                
    # Fill up with popular items if still less than 3
    if len(filtered_recs) < 3:
        for d in DEFAULT_RECOMMENDATIONS:
            if d not in filtered_recs and d not in purchased_items:
                filtered_recs.append(d)
            if len(filtered_recs) >= 3:
                break
                
    return filtered_recs[:3]


# --- 4. Business Insights Engine ---

def get_business_insights(db_session) -> list[dict]:
    """
    Analyzes overall store metrics and generates auto-generated plain language recommendations.
    """
    from .models import Customer, Order, Review
    
    insights = []
    
    # Count totals
    total_customers = db_session.query(Customer).count()
    if total_customers == 0:
        return [{"type": "info", "message": "Add customers to get business intelligence insights."}]
        
    # Churn metrics
    high_churn = db_session.query(Customer).filter(Customer.churn_risk == "High").count()
    vip_count = db_session.query(Customer).filter(Customer.segment == "VIP").count()
    
    # Category sales ranking
    orders = db_session.query(Order).all()
    categories_rev = {}
    for o in orders:
        categories_rev[o.category] = categories_rev.get(o.category, 0) + (o.price * o.quantity)
        
    top_category = max(categories_rev.items(), key=lambda x: x[1])[0] if categories_rev else "None"
    
    # 1. VIP Loyalty Insight
    if vip_count > 0:
        insights.append({
            "type": "success",
            "title": "VIP Retention Opportunity",
            "message": f"You have {vip_count} VIP customers contributing high revenue. Recommend sending custom loyalty rewards or early access catalogs to maintain their engagement.",
            "impact": "High Retention Boost"
        })
        
    # 2. Churn Risk Warning
    churn_percentage = (high_churn / total_customers) * 100
    if churn_percentage > 10:
        insights.append({
            "type": "warning",
            "title": "High Churn Risk Detected",
            "message": f"{high_churn} customers ({churn_percentage:.1f}% of base) show high churn probability. Trigger email discount codes and schedule support check-ins immediately.",
            "impact": "Prevent Customer Loss"
        })
    else:
        insights.append({
            "type": "info",
            "title": "Churn Levels Healthy",
            "message": "Churn risk levels are stable (<10% of customers are High Risk). Maintain current onboarding flows and satisfaction checks.",
            "impact": "Stable Retention"
        })
        
    # 3. Top Category Insight
    if top_category != "None":
        insights.append({
            "type": "info",
            "title": "Top Selling Category",
            "message": f"'{top_category}' is your best-performing product category by revenue this period. Allocate more ad spend and stock inventory accordingly.",
            "impact": "Sales Optimisation"
        })
        
    # 4. Review Sentiment Insight
    reviews = db_session.query(Review).all()
    neg_reviews = sum(1 for r in reviews if r.sentiment_label == "Negative")
    if reviews and neg_reviews / len(reviews) > 0.15:
        insights.append({
            "type": "danger",
            "title": "Negative Customer Sentiment Spike",
            "message": f"{neg_reviews} reviews have negative sentiment. Check comments for specific product complaints to fix quality or delivery issues.",
            "impact": "Brand Reputation"
        })
        
    return insights

from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="employee") # admin or employee
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    city = Column(String, nullable=False)
    join_date = Column(Date, nullable=False)
    
    # ML Outputs (allow null/default initial values before first training)
    segment = Column(String, default="New") # VIP, Regular, New, Inactive
    churn_probability = Column(Float, default=0.0)
    churn_risk = Column(String, default="Low") # Low, Medium, High
    predicted_clv = Column(Float, default=0.0)
    avg_sentiment = Column(Float, default=0.0)

    # Relationships
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="customer", cascade="all, delete-orphan")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    product = Column(String, nullable=False)
    category = Column(String, nullable=False) # Electronics, Apparel, Home, Books
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)

    # Relationship
    customer = relationship("Customer", back_populates="orders")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False) # 1 to 5
    comment = Column(Text, nullable=True)
    sentiment_score = Column(Float, default=0.0) # -1 to 1
    sentiment_label = Column(String, default="Neutral") # Positive, Neutral, Negative
    date = Column(Date, nullable=False)

    # Relationship
    customer = relationship("Customer", back_populates="reviews")

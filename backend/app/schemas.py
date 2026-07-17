from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date, datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Order Schemas ---
class OrderBase(BaseModel):
    product: str
    category: str
    price: float
    quantity: int
    date: date

class OrderCreate(OrderBase):
    customer_id: int

class OrderOut(OrderBase):
    id: int
    customer_id: int

    class Config:
        from_attributes = True


# --- Review Schemas ---
class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None
    date: date

class ReviewCreate(ReviewBase):
    customer_id: int

class ReviewOut(ReviewBase):
    id: int
    customer_id: int
    sentiment_score: float
    sentiment_label: str

    class Config:
        from_attributes = True


# --- Customer Schemas ---
class CustomerBase(BaseModel):
    name: str
    age: int
    gender: str
    email: EmailStr
    city: str
    join_date: date

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    join_date: Optional[date] = None

class CustomerOut(CustomerBase):
    id: int
    segment: str
    churn_probability: float
    churn_risk: str
    predicted_clv: float
    avg_sentiment: float

    class Config:
        from_attributes = True

# Extended Customer Out including all orders & reviews
class CustomerDetailOut(CustomerOut):
    orders: List[OrderOut] = []
    reviews: List[ReviewOut] = []

    class Config:
        from_attributes = True


class CustomerListResponse(BaseModel):
    total: int
    items: List[CustomerOut]
    skip: int
    limit: int


# --- KPI & Analytics Response Schemas ---
class KPICard(BaseModel):
    title: str
    value: str
    change: str # e.g. "+12% this month"
    type: str # "currency", "number", "percentage"

class RevenueTrendItem(BaseModel):
    date: str
    revenue: float

class SegmentCount(BaseModel):
    segment: str
    count: int
    avg_clv: float

class ChurnRiskCount(BaseModel):
    risk: str
    count: int

class CategoryRevenueItem(BaseModel):
    category: str
    revenue: float
    quantity: int

class TopCustomerItem(BaseModel):
    id: int
    name: str
    email: str
    total_spent: float
    orders_count: int
    churn_risk: str

class DashboardMetrics(BaseModel):
    total_customers: int
    active_customers: int
    new_customers: int
    total_revenue: float
    avg_order_value: float
    avg_review_rating: float
    revenue_trend: List[RevenueTrendItem]
    segments: List[SegmentCount]
    churn_distribution: List[ChurnRiskCount]
    category_sales: List[CategoryRevenueItem]
    top_customers: List[TopCustomerItem]

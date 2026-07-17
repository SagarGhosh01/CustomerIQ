from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, auth

# We will import the sentiment score function from analytics.py
from ..analytics import analyze_sentiment

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

@router.post("/", response_model=schemas.ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_employee)
):
    # Verify customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == review.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    # Analyze Sentiment score
    score, label = analyze_sentiment(review.comment or "")
    
    db_review = models.Review(
        customer_id=review.customer_id,
        rating=review.rating,
        comment=review.comment,
        sentiment_score=score,
        sentiment_label=label,
        date=review.date
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # Recalculate customer's average sentiment score
    all_reviews = db.query(models.Review).filter(models.Review.customer_id == review.customer_id).all()
    if all_reviews:
        avg_sentiment = sum([r.sentiment_score for r in all_reviews]) / len(all_reviews)
        customer.avg_sentiment = avg_sentiment
        db.commit()
        
    return db_review

@router.get("/customer/{customer_id}", response_model=List[schemas.ReviewOut])
def get_customer_reviews(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_employee)
):
    reviews = db.query(models.Review).filter(models.Review.customer_id == customer_id).all()
    return reviews

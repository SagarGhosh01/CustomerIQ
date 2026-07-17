import csv
import io
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/api/customers", tags=["customers"])

@router.get("/", response_model=schemas.CustomerListResponse)
def read_customers(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    segment: Optional[str] = None,
    churn_risk: Optional[str] = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_employee)
):
    query = db.query(models.Customer)
    
    # Text Search Filter (Name, Email, City)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.Customer.name.like(search_filter),
                models.Customer.email.like(search_filter),
                models.Customer.city.like(search_filter)
            )
        )
        
    # Segment Filter
    if segment:
        query = query.filter(models.Customer.segment == segment)
        
    # Churn Risk Filter
    if churn_risk:
        query = query.filter(models.Customer.churn_risk == churn_risk)
        
    # Sorting
    col = getattr(models.Customer, sort_by, models.Customer.id)
    if sort_order.lower() == "desc":
        query = query.order_by(desc(col))
    else:
        query = query.order_by(asc(col))
        
    total_count = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return {
        "total": total_count,
        "items": items,
        "skip": skip,
        "limit": limit
    }

@router.get("/{customer_id}", response_model=schemas.CustomerDetailOut)
def read_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_employee)
):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/", response_model=schemas.CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer: schemas.CustomerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    # Check if email exists
    existing = db.query(models.Customer).filter(models.Customer.email == customer.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Customer email already registered")
        
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.put("/{customer_id}", response_model=schemas.CustomerOut)
def update_customer(
    customer_id: int,
    customer_in: schemas.CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    update_data = customer_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)
        
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/{customer_id}", status_code=status.HTTP_200_OK)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
    return {"detail": "Customer deleted successfully"}

@router.post("/upload", status_code=status.HTTP_200_OK)
def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be in CSV format")
        
    try:
        content = file.file.read().decode("utf-8")
        csv_reader = csv.DictReader(io.StringIO(content))
        
        # Verify Headers
        required_headers = ["Name", "Age", "Gender", "Email", "City", "JoinDate"]
        headers = csv_reader.fieldnames
        if not headers or not all(h in headers for h in required_headers):
            raise HTTPException(
                status_code=400,
                detail=f"CSV file must contain headers: {', '.join(required_headers)}"
            )
            
        success_count = 0
        error_count = 0
        
        for row in csv_reader:
            try:
                # Check for existing email in memory/db
                email = row["Email"].strip()
                existing = db.query(models.Customer).filter(models.Customer.email == email).first()
                if existing:
                    error_count += 1
                    continue # Skip duplicates
                    
                # Parse JoinDate
                try:
                    join_date = datetime.strptime(row["JoinDate"].strip(), "%Y-%m-%d").date()
                except ValueError:
                    join_date = datetime.now().date()
                    
                customer_db = models.Customer(
                    name=row["Name"].strip(),
                    age=int(row["Age"]),
                    gender=row["Gender"].strip(),
                    email=email,
                    city=row["City"].strip(),
                    join_date=join_date
                )
                db.add(customer_db)
                success_count += 1
            except Exception:
                error_count += 1
                continue
                
        db.commit()
        return {
            "detail": f"CSV import finished. Successfully imported {success_count} customers.",
            "errors_skipped": error_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")

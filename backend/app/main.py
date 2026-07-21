from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from . import models, auth
from .routers import auth as auth_router, customers, orders, reviews, analytics

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed default admin and employee accounts if none exist
def seed_default_users():
    db = SessionLocal()
    try:
        # Check if users exist
        admin = db.query(models.User).filter(models.User.email == "admin@customeriq.com").first()
        if not admin:
            admin_user = models.User(
                email="admin@customeriq.com",
                hashed_password=auth.get_password_hash("admin123"),
                full_name="System Administrator",
                role="admin"
            )
            db.add(admin_user)
            print("Seeded admin account (admin@customeriq.com / admin123)")
            
        employee = db.query(models.User).filter(models.User.email == "employee@customeriq.com").first()
        if not employee:
            employee_user = models.User(
                email="employee@customeriq.com",
                hashed_password=auth.get_password_hash("employee123"),
                full_name="Standard Employee",
                role="employee"
            )
            db.add(employee_user)
            print("Seeded employee account (employee@customeriq.com / employee123)")
            
        db.commit()
    except Exception as e:
        print(f"Error seeding default users: {e}")
    finally:
        db.close()

seed_default_users()

app = FastAPI(
    title="CustomerIQ API",
    description="Backend AI-Powered Customer Intelligence Service",
    version="1.0.0"
)

# CORS configurations
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://customer-iq-two.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\\.vercel\\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(analytics.router)

@app.get("/api")
def read_root():
    return {
        "status": "online",
        "service": "CustomerIQ Analytics Engine",
        "documentation": "/docs"
    }

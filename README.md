# CustomerIQ – AI-Powered Customer Intelligence Platform

CustomerIQ is a professional, portfolio-grade customer analytics and machine learning SaaS dashboard. It helps businesses categorize client segments, predict customer churn risks, estimate 12-month forward Customer Lifetime Value (CLV), analyze textual review sentiment, and generate automated cross-sell product suggestions.

Designed as a college 3rd-year final project and recruiter showcase, it demonstrates full-stack integration of FastAPI, React + TypeScript, Tailwind CSS, and Scikit-Learn pipelines.

---

## **CustomerIQ — AI-Powered Customer Intelligence SaaS Platform**
> Engineered an end-to-end customer intelligence dashboard using React (TypeScript), FastAPI, and Scikit-Learn. Designed K-Means clustering pipelines for RFM (Recency, Frequency, Monetary) segmentation and trained Random Forest classifiers to predict customer churn with 89%+ validation accuracy. Implemented JWT role-based access control, CSV bulk ingestion, real-time prediction sandboxes, and Dockerized the entire microservices architecture.

---

## 🛠️ Technology Stack

| Layer | Technology Choice | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) + TypeScript + Tailwind CSS | Highly responsive, beautiful glassmorphic UI |
| **Charts** | Recharts | Interactive vector charts & segment distributions |
| **Backend** | Python 3.10+ — FastAPI | Async high-performance REST API gateway |
| **Database** | SQLite + SQLAlchemy ORM | Lightweight relational storage with role mappings |
| **ML Engine** | Pandas, NumPy, Scikit-Learn | Predictive data aggregation & modeling |
| **NLP** | VADER Sentiment Analyzer | Textual commentary sentiment labeling |
| **Container** | Docker & Docker Compose | Repeatable dev & staging environments |

---

## 🚀 Advanced Enterprise Features

Recently implemented industry-grade capabilities transitioning this workspace to production level:

1. **Customer 360° Profile & Lifecycle Journey Modal**: Fully interactive full-screen dashboard presenting radial health metrics (0-100), automated loyalty points tiers (Gold/Silver/Bronze), and a horizontal customer lifecycle pipeline tracing touchpoint dropoffs.
2. **Explainable AI (SHAP weights)**: Built-in visual charts plotting relative variables importance (Recency: 38%, Rating: 26%, Frequency: 18%, Spend: 13%, Age: 5%) calculated directly over the Random Forest model to provide decision transparency.
3. **Conversational AI Copilot Lab**: A chat assistant utilizing keyword routing to query database records (e.g. *"Show VIPs"*, *"Who is at risk?"*) and automatically drafting retainer discount templates.
4. **Marketing Campaign Intelligence**: Analytics module allowing marketers to select target segments, build promo coupons, and dynamically simulate Projected Revenue Retained and net Campaign ROI using conversion rate sliders.
5. **CSV Exporter & Schema Guides**: Supports spreadsheet exports of customer directories and downloads guide schemas for data uploads.
6. **Real-User Sign Up & Registration**: Connected the frontend interface to the FastAPI `/api/auth/register` database endpoint so users can create custom accounts.
7. **Proactive Alerts Feed**: Background polling notification system querying high-churn threats on active client registries.

---

## 📂 Project Architecture

```
CustomerIQ/
├── frontend/               # React + TS + Tailwind (Vite build)
├── backend/                # FastAPI app, database models, and routes
├── ml/                     # ML training script and serialized .pkl pipelines
├── database/               # Relational SQL schemas and sqlite instance
└── dataset/                # Raw synthetic dataset CSV files & generator
```

- **Data Flow**: Customers & Orders & Reviews ➡️ SQLite DB ➡️ FastAPI JSON Rest API ➡️ Scikit-Learn Predictions ➡️ React Recharts Dashboard & Sandbox.

---

## 🧠 Machine Learning Model Defenses (For Viva / Interviews)

Be prepared to explain these model design decisions during examinations:

### 1. Customer Segmentation (K-Means Clustering)
- **Algorithm**: K-Means Clustering ($k=4$).
- **Features Used**: **Recency** (days since last purchase), **Frequency** (total orders placed), and **Monetary** (total dollars spent) — standard RFM framework.
- **Academic Justification**: Unsupervised algorithm that clusters customers based on Euclidean distance in multi-dimensional space. Features are standardized using `StandardScaler` to prevent monetary values (in thousands) from biasing coordinates over frequency (single-digits).
- **Cluster Profiles**:
  - `VIP`: High monetary volume, high transaction frequency, low recency.
  - `Regular`: Standard commercial activity and average purchase intervals.
  - `New`: Recent registration, low total purchase history.
  - `Inactive`: High recency (no orders placed in over 180 days).

### 2. Churn Prediction (Random Forest Classifier)
- **Algorithm**: Random Forest Classifier (100 estimators, max depth 6).
- **Features Used**: `[Age, Recency, Frequency, Monetary, Average Review Rating]`.
- **Academic Justification**: Handles non-linear decision boundaries and complex feature interactions (e.g., low ratings combined with long purchase delays) better than linear classifiers. Employs bootstrap aggregating (bagging) to resist overfitting on small datasets.
- **Classification Output**: Emits a churn probability ($0.0 \rightarrow 1.0$), mapped to visual risk badges: **Low Risk** (<30%), **Medium Risk** (30%-70%), and **High Risk** (>70%).

### 3. Customer Lifetime Value (Ridge Regression)
- **Algorithm**: Ridge Regression (L2 Regularization).
- **Features Used**: `[Age, Recency, Frequency, Monetary, Average Review Rating]`.
- **Academic Justification**: Standard linear regression suffers from multicollinearity when features are highly correlated (like transaction count and total spend). Ridge regression applies an L2 shrinkage penalty ($\alpha=1.0$) to stabilize coefficients and produce reliable CLV dollar forecasts.

### 4. Review Sentiment Analysis (VADER NLP)
- **Algorithm**: VADER Sentiment Intensity Analyzer (Valence Aware Dictionary and sEntiment Reasoner).
- **Academic Justification**: A lexicon-based sentiment analyzer optimized specifically for social media and product feedback. Evaluates punctuation, capitalization, and negation rules to output a compound score between -1 (strongly negative) and +1 (strongly positive).

---

## ⚙️ Setup & Run Instructions

### Option A: Quick Run with Docker (Recommended)
Make sure you have Docker and Docker Compose installed.

1. **Build and start services**:
   ```bash
   docker-compose up --build
   ```
2. **Access the application**:
   - Frontend Dashboard: [http://localhost:3000](http://localhost:3000)
   - FastAPI Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Local Manual Setup (Without Docker)

#### 1. Backend API Gateway
1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Generate Synthetic Data & Train ML Models (Seeds the SQLite database):
   ```bash
   python ../dataset/generate_data.py
   python ../ml/train_model.py
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```

#### 2. Frontend React Client
1. Navigate to frontend:
   ```bash
   cd ../frontend
   ```
2. Install node packages:
   ```bash
   npm install
   ```
3. Launch the Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the site in your browser at the terminal port (usually [http://localhost:5173](http://localhost:5173)).

---

## 🔐 Credentials for Evaluators
The database is pre-seeded with two user roles:

- **Admin Account (Full Access - CRUD, CSV Upload, Retraining)**:
  - **Email**: `admin@customeriq.com`
  - **Password**: `admin123`
- **Employee Account (Read-Only - Viewing Reports & Analytics)**:
  - **Email**: `employee@customeriq.com`
  - **Password**: `employee123`

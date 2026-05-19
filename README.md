# StayMate - Enterprise Boarding & Property Management Marketplace

StayMate is a comprehensive, full-stack platform designed to revolutionize the boarding and rental marketplace. It bridges the gap between tenants looking for the perfect living space and landlords managing their properties, all overseen by a robust platform administration system.

## 🚀 Key Features

### For Tenants (Clients)
*   **Intelligent Discovery:** Find properties using advanced Geospatial Search (location proximity) combined with a custom Machine Learning recommendation engine (FastAPI + Scikit-learn).
*   **Seamless Booking & Payments:** Streamlined booking process with secure payment tracking.
*   **Support Hub:** A built-in, real-time ticketing system to communicate directly with landlords for maintenance requests or to contact platform admins.
*   **Modern Dashboard:** Track active bookings, payment history, and personalized boarding recommendations.

### For Landlords
*   **Portfolio Management:** Add and manage "Full Properties" or "Room-Based" boardings. Upload property images directly to AWS S3.
*   **Financial Tracking:** A powerful command center with interactive charts (Recharts) to track completed revenue vs. pending incomes, and view real-time occupancy rates.
*   **Tenant Communication:** Respond to tenant maintenance requests and inquiries directly through the integrated Support Hub.
*   **Admin Support:** Direct communication line to platform administrators for quick issue resolution.

### For Platform Admins
*   **Global Oversight:** High-level system intelligence dashboard showing active landlords, residents, global revenue, and platform health.
*   **Growth Velocity Tracking:** Visual charts tracking user and listing growth over time.
*   **Dispute Management:** Monitor and resolve complaints sent by both tenants and landlords via the ticketing system.
*   **Infrastructure Command:** Approve or reject pending property listings to ensure platform quality.

## 🛠️ Technology Stack

### Frontend (Client Interface)
*   **React (Vite):** Fast, modern component-based UI.
*   **Tailwind CSS & Shadcn/UI:** For a highly responsive, premium, and dynamic design system (glassmorphism, tailored color palettes).
*   **Framer Motion:** Smooth micro-animations and page transitions.
*   **Recharts:** Dynamic, responsive data visualization for dashboards.
*   **Axios:** API communication.

### Backend (Core Server)
*   **Node.js & Express:** Scalable and fast RESTful API architecture.
*   **MongoDB & Mongoose:** NoSQL database optimized for geospatial queries (`$geoNear`) and complex relational referencing.
*   **JWT (JSON Web Tokens):** Secure, stateless authentication and role-based access control.
*   **AWS S3 SDK:** Secure cloud storage for boarding images and user avatars.

### Machine Learning Service (Microservice)
*   **Python & FastAPI:** High-performance API serving the recommendation model.
*   **Scikit-Learn:** Data preprocessing and machine learning inference (`boarding_model.pkl`) to generate smart relevance scores based on user preferences.

## 📂 Project Structure

```
d:\boarding-system\
├── backend/                  # Node.js & Express API
│   ├── src/
│   │   ├── controllers/      # Business logic (auth, boardings, tickets)
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express route definitions
│   │   ├── middleware/       # JWT Auth and Role protection
│   │   └── utils/            # Helpers (Token generation, AWS S3 upload)
│   └── .env                  # Environment variables
├── frontend/                 # React UI
│   ├── src/
│   │   ├── api/              # Axios API wrappers
│   │   ├── components/       # Reusable UI components (Navbars, Sidebars)
│   │   ├── pages/            # Role-specific pages (Admin, Client, Dashboard)
│   │   ├── lib/              # Utility functions (Auth session management)
│   │   └── routes/           # React Router DOM configuration
│   └── tailwind.config.js    # Tailwind theme and plugin settings
└── ml_service/               # (Conceptual) FastAPI Recommendation Engine
```

## ⚙️ Local Development Setup

### Prerequisites
*   Node.js (v16+)
*   MongoDB Instance (Local or Atlas)
*   AWS S3 Account Credentials (for image uploads)
*   Python 3.8+ (for the ML Service)

### 1. Start the Backend
```bash
cd backend
npm install
# Ensure you have a .env file with MONGO_URI, JWT_SECRET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME
npm run dev
```
*The backend will run on `http://localhost:5000`*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173` (or port specified by Vite)*

### 3. Start the ML Service
```bash
# Navigate to your python ml directory
pip install fastapi uvicorn scikit-learn pandas
uvicorn main:app --reload --port 8000
```

## 🔒 Authentication & Roles
The application strictly enforces route protection on both the frontend (React Router guards) and backend (Express middleware).
*   **Tenant:** Can browse marketplace, book properties, and open tickets.
*   **Landlord:** Can manage their own properties, view their financial dashboard, and reply to their tenants.
*   **Admin:** Has read/write access to all platform data, user management, and global metrics.

## 🚀 Deployment (Production)
*   **Backend:** Configured for deployment on platforms like Render or Heroku (requires setting environment variables in the cloud dashboard).
*   **Frontend:** Optimized for Vercel or Netlify.
*   **Database:** MongoDB Atlas recommended for production data stability.

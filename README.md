# Advik E-Commerce

Full-stack e-commerce project for Advik Creation (Indian fashion wear). **Single repo** with backend, admin panel, and customer storefront.

## Project Structure

- **backend** - Node.js + Express + MongoDB API
- **advik-admin** - Admin panel for managing products (http://localhost:5173)
- **stylejaipur-clone** - Customer-facing storefront (http://localhost:5174)

## Quick Start

### 1. Start MongoDB

Ensure MongoDB is running locally (`mongodb://localhost:27017`) or update `MONGODB_URI` in backend `.env`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed    # Seed database with initial data
npm run dev     # Start API on http://localhost:4000
```

### 3. Customer Frontend (stylejaipur-clone)

```bash
cd stylejaipur-clone
npm install
npm run dev     # http://localhost:5174
```

### 4. Admin Panel (advik-admin)

```bash
cd advik-admin
npm install
npm run dev     # http://localhost:5173
```

## Data Flow

- **Admin** adds/edits products → saved to MongoDB via backend API
- **Customer frontend** fetches products, hero slides, offers, reviews from backend
- Changes in backend appear on frontend on refresh/navigation

## Environment Variables

**Backend** (`.env`):
- `PORT` - API port (default 4000)
- `MONGODB_URI` - MongoDB connection string
- `CLIENT_URL` - CORS origin (default http://localhost:5174)

**Frontend** (`.env`):
- `VITE_API_URL` - Backend API URL (default http://localhost:4000/api)

## Push to GitHub (one repo)

Create a new repo (e.g. `advik_creation` or `advik-ecom`) on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

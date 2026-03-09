# Advik E-Commerce Backend

Node.js + Express + MongoDB backend for the Advik Creation customer frontend.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

1. Install dependencies:
   ```bash
   cd backend && npm install
   ```

2. Create `.env` (copy from `.env.example`):
   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/advik_ecom
   CLIENT_URL=http://localhost:5174
   ```

3. Seed the database with mock data:
   ```bash
   npm run seed
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

Server runs at `http://localhost:4000`

## API Endpoints

### Products
- `GET /api/products` - All products
- `GET /api/products/new-arrivals` - New arrivals
- `GET /api/products/best-sellers` - Best sellers
- `GET /api/products/category/:category` - By category (slug)
- `GET /api/products/subcategory/:subcategory` - By subcategory (slug)
- `GET /api/products/find-your-fit?category=&subcategory=` - Find Your Fit
- `GET /api/products/search?q=` - Search
- `GET /api/products/:id` - Single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Banners
- `GET /api/banners/hero-slides` - Hero carousel
- `GET /api/banners/offers` - Special offers
- `GET /api/banners/reviews` - Customer reviews + summary
- `GET /api/banners/find-your-fit` - Find Your Fit categories

### Upload
- `POST /api/upload/image` - Upload single image (form-data, field: `image`)
- `POST /api/upload/images` - Upload multiple images (form-data, field: `images`)

## Adding Data via API

Add a product:
```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"New Product","description":"...","price":999,"image":"https://...","sizes":["M","L"],"category":"Womens Wear"}'
```

Data added via API will appear on the frontend automatically when you refresh or navigate.

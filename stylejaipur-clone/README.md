# Advik Creation

A React-based e-commerce website for Advik Creation, featuring Indian fashion wear including Kurtas, Suit Sets, Co-Ord Sets, and more.

## Features

- 🛍️ **Product Catalog**: Browse through various categories of Indian fashion wear
- 🛒 **Shopping Cart**: Add products to cart with size selection
- 🔍 **Search Functionality**: Search for products (UI ready)
- 📱 **Responsive Design**: Mobile-friendly interface
- ⭐ **Product Ratings**: Display product ratings and reviews
- 🎨 **Modern UI**: Clean and elegant design matching the original website

## Tech Stack

- **React 19** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Vite** for build tooling

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or >=22.12.0 recommended)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd stylejaipur-clone
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
stylejaipur-clone/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Header.tsx   # Navigation and cart
│   │   ├── Footer.tsx   # Footer with links
│   │   ├── ProductCard.tsx
│   │   └── ProductList.tsx
│   ├── pages/           # Page components
│   │   ├── Home.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   └── ProductListPage.tsx
│   ├── context/          # React Context
│   │   └── CartContext.tsx
│   ├── data/            # Data files
│   │   └── products.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── package.json
```

## Features Implemented

- ✅ Home page with hero section
- ✅ Product listings (New Arrivals, Best Sellers)
- ✅ Product detail pages
- ✅ Shopping cart functionality
- ✅ Category and subcategory navigation
- ✅ Responsive header with cart dropdown
- ✅ Footer with company information
- ✅ Special offers banner
- ✅ Customer reviews section

## Customization

### Adding Products

Edit `src/data/products.ts` to add or modify products.

### Styling

The project uses Tailwind CSS. Customize colors and styles in `tailwind.config.js`.

### Routes

Routes are defined in `src/App.tsx`. Add new routes as needed.

## License

This is a clone project for educational purposes.

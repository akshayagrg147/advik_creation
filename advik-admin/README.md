# Advik Creation Admin Panel

A comprehensive admin panel for managing the Advik Creation e-commerce website.

## Features

### 🔐 Authentication
- Secure login system
- Session management
- Protected routes

### 📊 Dashboard
- Overview statistics (Products, Orders, Revenue, Customers)
- Sales charts and analytics
- Recent orders display
- Performance metrics

### 🛍️ Product Management
- Add, Edit, Delete products
- Product search and filtering
- Stock management
- Category assignment
- Image upload support
- Price and discount management

### 📦 Order Management
- View all orders
- Filter by status
- Update order status
- Track order details
- Payment status management

### 👥 Customer Management
- View customer database
- Search customers
- Activate/Deactivate customers
- View customer details

### 🏷️ Category Management
- Add, Edit, Delete categories
- Manage subcategories
- Category organization

### 📈 Analytics
- Sales trends
- Order analytics
- Category-wise sales
- Revenue charts

### ⚙️ Settings
- General site settings
- E-commerce configuration
- Tax and shipping settings
- Currency management

## Getting Started

### Prerequisites
- Node.js (v20.19.0 or >=22.12.0 recommended)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd advik-admin
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

### Login Credentials

**Demo Account:**
- Username: `admin`
- Password: `admin123`

## Project Structure

```
advik-admin/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.tsx   # Main layout with sidebar
│   │   └── ProtectedRoute.tsx
│   ├── pages/           # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Products.tsx
│   │   ├── Orders.tsx
│   │   ├── Customers.tsx
│   │   ├── Categories.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── context/          # React Context
│   │   └── AuthContext.tsx
│   ├── data/            # Mock data
│   │   └── mockData.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
└── package.json
```

## Tech Stack

- **React 19** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **Recharts** for charts and analytics
- **Vite** for build tooling

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Features in Detail

### Product Management
- Full CRUD operations
- Image management
- Stock tracking
- Category assignment
- Price and discount management

### Order Management
- Real-time order tracking
- Status updates
- Payment tracking
- Customer information

### Analytics Dashboard
- Visual charts and graphs
- Sales trends
- Category performance
- Revenue tracking

## Future Enhancements

- [ ] Inventory management
- [ ] Coupon/Discount management
- [ ] Email notifications
- [ ] Export functionality (CSV, PDF)
- [ ] Advanced reporting
- [ ] Multi-user roles and permissions
- [ ] API integration with backend
- [ ] Real-time notifications

## License

This is a private admin panel for Advik Creation.

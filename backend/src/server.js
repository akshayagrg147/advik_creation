import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import productRoutes from './routes/products.js';
import bannerRoutes from './routes/banners.js';
import uploadRoutes from './routes/upload.js';
import dashboardRoutes from './routes/dashboard.js';
import orderRoutes from './routes/orders.js';
import settingsRoutes from './routes/settings.js';
import authRoutes from './routes/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

const allowedOrigins = [
  'http://localhost:5173',  // advik-admin
  'http://localhost:5174',  // stylejaipur-clone
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Serve uploaded files
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.use('/api/products', productRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Advik Ecom API' });
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Advik Ecom API is running',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      banners: '/api/banners',
      orders: '/api/orders',
      dashboard: '/api/dashboard',
      auth: '/api/auth',
      settings: '/api/settings',
      upload: '/api/upload',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

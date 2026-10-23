
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL,

  // Vercel frontend domains
  'https://medicine-availability-finder-reserv.vercel.app',
  'https://medicine-availability-finder-reservation-system-pea84oxk3.vercel.app',
  'https://medicine-avalilabilty-finder-reservation-system-pea84oxk3.vercel.app',
  'https://medicine-availability-git-6acbe3-babalala1231412-3360s-projects.vercel.app',
  'https://medicine-avalilabilty-finder-reserv.vercel.app',

  // Local development
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error('CORS blocked origin:', origin);
      return callback(new Error('CORS policy: Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health Check
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pharmacy Medicine API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pharmacies', require('./routes/pharmacyRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
});

// Admin Account Seeder
const seedAdminUser = async () => {
  try {
    const User = require('./models/User');

    const existing = await User.findOne({
      email: 'admin@medifind.com',
    });

    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('demo1234', salt);

      await User.create({
        name: 'MediFind Admin',
        email: 'admin@medifind.com',
        password: hashedPassword,
        role: 'admin',
      });

      console.log('Admin account created: admin@medifind.com');
    } else {
      console.log('Admin account already exists — skipping creation.');
    }
  } catch (err) {
    console.error('Admin seed error:', err.message);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API test: http://localhost:${PORT}/api/test`);

  connectDB()
    .then(seedAdminUser)
    .catch((err) => {
      console.error('Database connection failed:', err.message);
    });
});

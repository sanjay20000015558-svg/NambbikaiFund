require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const campaignRoutes = require('./routes/campaigns');
const donationRoutes = require('./routes/donations');
const withdrawalRoutes = require('./routes/withdrawals');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const chatbotRoutes = require('./routes/chatbot');
const translateRoutes = require('./routes/translate');

// Initialize translation service
const { initializeTranslationService } = require('./services/translationService');
initializeTranslationService();

// Error handling
const errorHandler = require('./middlewares/errorHandler');
const { languageMiddleware } = require('./middlewares/languageMiddleware');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for serverless compatibility
}));

// CORS configuration
// Support multiple origins (localhost, LAN IP, and production URLs)
const defaultFrontendUrls = [
  'http://localhost:3000',
  'http://192.168.1.203:3000',
  'https://nambbikai-fund-s3ql-qdpjseybf-sanjay-kumars-projects-6d1d4c33.vercel.app'
];
const corsOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
  : defaultFrontendUrls;

const isAllowedOrigin = (origin) => {
  if (!origin) return false;
  return origin.includes('.vercel.app') || corsOrigins.includes(origin);
};

// Manual CORS headers are added before helmet/cors so Vercel preflight always gets headers.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  }
  next();
});

// Also add Vercel preview URLs pattern
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting (skip OPTIONS requests)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // Skip preflight requests
});
app.use('/api/', limiter);

// Strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again after 15 minutes'
});
app.use('/api/auth', authLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve locale files for i18next
app.use('/locales', express.static(path.join(__dirname, '../frontend/public/locales')));

// Language middleware for localization
app.use(languageMiddleware);

// Backward compatibility for old frontend builds that call routes without /api.
// Internally all routes are still handled by the /api route groups below.
const fallbackRoutePrefixes = [
  '/auth',
  '/campaigns',
  '/users',
  '/donations',
  '/withdrawals',
  '/admin',
  '/payments',
  '/notifications',
  '/chatbot',
  '/translate'
];
app.use((req, res, next) => {
  const requestPath = req.path.split('?')[0];
  if (fallbackRoutePrefixes.some(prefix => requestPath === prefix || requestPath.startsWith(`${prefix}/`))) {
    req.url = `/api${req.url}`;
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/translate', translateRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend Root Working"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Health Route Working"
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});
// Error handling middleware (must be last)
app.use(errorHandler);

// MongoDB connection
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://skworkinfo:Sanjay123@ac-zihorh4-shard-00-00.ptck28k.mongodb.net:27017,ac-zihorh4-shard-00-01.ptck28k.mongodb.net:27017,ac-zihorh4-shard-00-02.ptck28k.mongodb.net:27017/NambikkaiFund?ssl=true&replicaSet=atlas-ntzyza-shard-0&authSource=admin&retryWrites=true&w=majority';
  try {
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  mongoose.connection.close(() => {
    console.log("MongoDB Closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received");
  mongoose.connection.close(() => {
    console.log("MongoDB Closed");
    process.exit(0);
  });
});

// Connect MongoDB
connectDB();

module.exports = app;
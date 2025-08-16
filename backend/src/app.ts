import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/error';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration to allow both web and mobile app requests
const allowedOrigins = [
  'https://skeo-trace.vercel.app', // Web frontend
  'http://localhost:3000', // Local development
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow specific origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For production, be more permissive for mobile apps
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true); // Allow all origins for mobile apps
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SkeoTrace API',
    version: '1.0.0',
    health: '/api/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

export default app;

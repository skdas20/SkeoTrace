// Express app setup with security, CORS, logging, routes and error handling
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/error';

// Create Express app instance
const app = express();

// Apply basic security headers
app.use(helmet());

// Configure CORS with allowed origins and fallback behavior
const allowedOrigins = [
  'https://skeo-trace.vercel.app', // production frontend
  'http://localhost:3000', // local dev frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests that lack origin header (tools, mobile apps)
    if (!origin) return callback(null, true);

    // Allow only whitelisted origins in development
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In production allow mobile apps by default; otherwise reject
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// HTTP request logging (combined format)
app.use(morgan('combined'));

// Parse JSON and URL-encoded bodies with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes under /api
app.use('/api', routes);

// Simple root health/info endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SkeoTrace API',
    version: '1.0.0',
    health: '/api/health'
  });
});

// Fallback 404 handler for any other routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Central error handler middleware
app.use(errorHandler);

export default app;

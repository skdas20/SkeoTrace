import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import routes from './routes';
import { errorHandler } from './middleware/error';

// Create Express app
const app = express();

// Load OpenAPI spec
const openApiPath = path.join(__dirname, 'docs', 'openapi.yaml');
const openApiFile = fs.readFileSync(openApiPath, 'utf8');
const openApiDocument = YAML.parse(openApiFile);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_PUBLIC_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customSiteTitle: 'Organic Food Traceability API',
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Organic Food Traceability API',
    version: '1.0.0',
    documentation: '/docs',
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

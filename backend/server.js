import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import helmet from 'helmet';

// Load environment variables
dotenv.config();

import toneRoutes from './routes/toneRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

console.log(' Starting Tone Picker API Server...');
console.log(' Mistral API Key:', process.env.MISTRAL_API_KEY ? 'Configured ' : 'Missing ');

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(` ${req.method} ${req.url}`, req.method === 'POST' ? req.body : '');
    next();
});

// Routes
app.use('/api/tone', toneRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: PORT
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Tone Picker API Server',
        version: '1.0.0',
        endpoints: ['/api/tone/adjust', '/api/tone/health', '/health'],
        status: 'Running '
    });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler - Simple version without problematic app.use("*")
app.use((req, res) => {
    console.log(' 404 - Route not found:', req.method, req.url);
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` Environment: ${process.env.NODE_ENV}`);
    console.log(` Ready to accept requests!`);
});

export default app;
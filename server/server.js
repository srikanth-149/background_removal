import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL, // Use env variable
    credentials: true
}));

// Body parsing middleware (except for webhooks)
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Background Removal API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/user', userRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/webhook', webhookRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(` Server running on port ${PORT}`);
        // console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        //console.log(`🌐 API URL: http://localhost:${PORT}`);
       // console.log(`💳 Stripe Mode: ${process.env.STRIPE_SECRET_KEY?.includes('test') ? 'Test' : 'Live'}`);
    });
}

// Export for Vercel
export default app;

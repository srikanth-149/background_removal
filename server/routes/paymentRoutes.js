import express from 'express';
import { 
    getCreditPackages, 
    createCheckoutSession, 
    handlePaymentSuccess, 
    getPaymentHistory 
} from '../controllers/paymentController.js';
import { verifyClerkToken } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/payment/packages - Get available credit packages (no auth required)
router.get('/packages', getCreditPackages);

// Routes that require authentication
router.use(verifyClerkToken);

// POST /api/payment/create-checkout - Create Stripe checkout session
router.post('/create-checkout', createCheckoutSession);

// POST /api/payment/success - Handle successful payment
router.post('/success', handlePaymentSuccess);

// GET /api/payment/history - Get payment history
router.get('/history', getPaymentHistory);

export default router;


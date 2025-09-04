import express from 'express';
import { clerkWebhook } from '../controllers/webhookController.js';
import { stripeWebhook } from '../controllers/paymentController.js';

const router = express.Router();

// POST /api/webhook/clerk - Clerk webhook for user events
router.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhook);

// POST /api/webhook/stripe - Stripe webhook for payment events
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;


import express from 'express';
import { 
    getUserProfile, 
    getUserCredits, 
    getUserTransactions, 
    updateUserProfile 
} from '../controllers/userController.js';
import { verifyClerkToken } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyClerkToken);

// GET /api/user/profile - Get user profile
router.get('/profile', getUserProfile);

// PUT /api/user/profile - Update user profile
router.put('/profile', updateUserProfile);

// GET /api/user/credits - Get user credits
router.get('/credits', getUserCredits);

// GET /api/user/transactions - Get user transaction history
router.get('/transactions', getUserTransactions);

export default router;


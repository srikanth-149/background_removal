import userModel from '../models/userModel.js';
import transactionModel from '../models/transactionModel.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    
    res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: {
            id: user._id,
            clerkId: user.clerkId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            credits: user.credits,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    });
});

// Get user credits
export const getUserCredits = asyncHandler(async (req, res) => {
    const user = req.user;
    
    res.status(200).json({
        success: true,
        message: 'User credits retrieved successfully',
        data: {
            credits: user.credits
        }
    });
});

// Get user transaction history
export const getUserTransactions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const user = req.user;
    
    const transactions = await transactionModel
        .find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v');
    
    const total = await transactionModel.countDocuments({ userId: user._id });
    
    res.status(200).json({
        success: true,
        message: 'Transaction history retrieved successfully',
        data: {
            transactions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalTransactions: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }
    });
});

// Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName } = req.body;
    const user = req.user;
    
    if (!firstName || !lastName) {
        return res.status(400).json({
            success: false,
            message: 'First name and last name are required'
        });
    }
    
    const updatedUser = await userModel.findByIdAndUpdate(
        user._id,
        { firstName, lastName },
        { new: true, runValidators: true }
    );
    
    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            id: updatedUser._id,
            clerkId: updatedUser.clerkId,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            credits: updatedUser.credits,
            isActive: updatedUser.isActive,
            updatedAt: updatedUser.updatedAt
        }
    });
});

// Deduct credits (internal function)
export const deductCredits = async (userId, credits = 1, description = 'Background removal') => {
    try {
        const user = await userModel.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        if (user.credits < credits) {
            throw new Error('Insufficient credits');
        }
        
        // Update user credits
        user.credits -= credits;
        await user.save();
        
        // Create transaction record
        const transaction = new transactionModel({
            userId: user._id,
            clerkId: user.clerkId,
            type: 'credit_used',
            amount: 0, // No money involved for credit usage
            credits: credits,
            status: 'completed',
            description
        });
        
        await transaction.save();
        
        return {
            success: true,
            remainingCredits: user.credits,
            transaction
        };
    } catch (error) {
        throw error;
    }
};

// Add credits (internal function)
export const addCredits = async (userId, credits, amount, stripeSessionId = null, description = 'Credit purchase') => {
    try {
        const user = await userModel.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Update user credits
        user.credits += credits;
        await user.save();
        
        // Create transaction record
        const transaction = new transactionModel({
            userId: user._id,
            clerkId: user.clerkId,
            type: 'credit_purchase',
            amount: amount,
            credits: credits,
            stripeSessionId,
            status: 'completed',
            description
        });
        
        await transaction.save();
        
        return {
            success: true,
            totalCredits: user.credits,
            transaction
        };
    } catch (error) {
        throw error;
    }
};


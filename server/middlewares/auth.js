import { clerkClient } from '@clerk/clerk-sdk-node';
import userModel from '../models/userModel.js';

// Middleware to verify Clerk JWT token
export const verifyClerkToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        // Verify the token with Clerk
        const payload = await clerkClient.verifyToken(token);
        
        if (!payload || !payload.sub) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Get user from database
        let user = await userModel.findOne({ clerkId: payload.sub });
        
        if (!user) {
            // Get user details from Clerk
            const clerkUser = await clerkClient.users.getUser(payload.sub);
            
            // Create user if not exists
            user = await createUserIfNotExists(
                payload.sub,
                clerkUser.emailAddresses[0]?.emailAddress,
                clerkUser.firstName || 'User',
                clerkUser.lastName || ''
            );
        }

        // Add user info to request object
        req.user = user;
        req.clerkId = payload.sub;
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

// Middleware to check if user has enough credits
export const checkCredits = async (req, res, next) => {
    try {
        const user = req.user;
        
        if (!user || user.credits < 1) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient credits. Please purchase more credits to continue.',
                credits: user ? user.credits : 0
            });
        }
        
        next();
    } catch (error) {
        console.error('Credits check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking credits',
            error: error.message
        });
    }
};

// Middleware to create user if not exists (for webhook)
export const createUserIfNotExists = async (clerkId, email, firstName, lastName) => {
    try {
        let user = await userModel.findOne({ clerkId });
        
        if (!user) {
            // Check if user exists with same email but different/null clerkId
            const existingUser = await userModel.findOne({ email });
            
            if (existingUser) {
                // Update existing user with clerkId
                existingUser.clerkId = clerkId;
                existingUser.firstName = firstName || existingUser.firstName;
                existingUser.lastName = lastName || existingUser.lastName;
                
                // Ensure user has at least 5 credits
                if (existingUser.credits < 5) {
                    existingUser.credits = 5;
                }
                
                user = await existingUser.save();
                console.log(`Updated existing user: ${email} with clerkId and ensured 5 credits`);
            } else {
                // Create new user
                user = new userModel({
                    clerkId,
                    email,
                    firstName,
                    lastName,
                    credits: 5 // 5 free credits on signup
                });
                
                await user.save();
                console.log(`New user created: ${email} with 5 free credits`);
            }
        }
        
        return user;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};


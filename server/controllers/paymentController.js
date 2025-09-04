import Stripe from 'stripe';
import { addCredits } from './userController.js';
import transactionModel from '../models/transactionModel.js';
import userModel from '../models/userModel.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Credit packages
const creditPackages = {
    basic: {
        credits: 10,
        price: 500, // $5.00 in cents
        name: 'Basic Package',
        description: '10 credits for background removal'
    },
    standard: {
        credits: 25,
        price: 1000, // $10.00 in cents
        name: 'Standard Package',
        description: '25 credits for background removal'
    },
    premium: {
        credits: 50,
        price: 1800, // $18.00 in cents
        name: 'Premium Package',
        description: '50 credits for background removal'
    },
    enterprise: {
        credits: 100,
        price: 3000, // $30.00 in cents
        name: 'Enterprise Package',
        description: '100 credits for background removal'
    }
};

// Get available credit packages
export const getCreditPackages = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Credit packages retrieved successfully',
        data: creditPackages
    });
});

// Create Stripe checkout session
export const createCheckoutSession = asyncHandler(async (req, res) => {
    const { packageType } = req.body;
    const user = req.user;
    
    if (!packageType || !creditPackages[packageType]) {
        return res.status(400).json({
            success: false,
            message: 'Invalid package type'
        });
    }
    
    const package_ = creditPackages[packageType];
    
    try {
        // Create pending transaction
        const transaction = new transactionModel({
            userId: user._id,
            clerkId: user.clerkId,
            type: 'credit_purchase',
            amount: package_.price / 100, // Convert cents to dollars
            credits: package_.credits,
            status: 'pending',
            description: `Purchase of ${package_.name}`
        });
        
        await transaction.save();
        
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: process.env.CURRENCY || 'USD',
                        product_data: {
                            name: package_.name,
                            description: package_.description,
                            images: ['https://your-domain.com/credit-icon.png'], // Optional
                        },
                        unit_amount: package_.price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
            client_reference_id: user.clerkId,
            metadata: {
                userId: user._id.toString(),
                transactionId: transaction._id.toString(),
                packageType: packageType,
                credits: package_.credits.toString()
            },
            customer_email: user.email,
        });
        
        // Update transaction with session ID
        transaction.stripeSessionId = session.id;
        await transaction.save();
        
        res.status(200).json({
            success: true,
            message: 'Checkout session created successfully',
            data: {
                sessionId: session.id,
                url: session.url,
                transactionId: transaction._id
            }
        });
        
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create checkout session',
            error: error.message
        });
    }
});

// Handle successful payment
export const handlePaymentSuccess = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            message: 'Session ID is required'
        });
    }
    
    try {
        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment not completed'
            });
        }
        
        // Find the transaction
        const transaction = await transactionModel.findOne({
            stripeSessionId: sessionId
        });
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        if (transaction.status === 'completed') {
            return res.status(200).json({
                success: true,
                message: 'Payment already processed',
                data: {
                    credits: transaction.credits,
                    amount: transaction.amount
                }
            });
        }
        
        // Add credits to user account
        const result = await addCredits(
            transaction.userId,
            transaction.credits,
            transaction.amount,
            sessionId,
            transaction.description
        );
        
        // Update transaction status
        transaction.status = 'completed';
        transaction.stripePaymentIntentId = session.payment_intent;
        await transaction.save();
        
        // Get updated user
        const updatedUser = await userModel.findById(transaction.userId);
        
        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                credits: transaction.credits,
                amount: transaction.amount,
                totalCredits: updatedUser.credits,
                transactionId: transaction._id
            }
        });
        
    } catch (error) {
        console.error('Payment success handler error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment',
            error: error.message
        });
    }
});

// Stripe webhook handler
export const stripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({
            success: false,
            message: 'Webhook signature verification failed'
        });
    }
    
    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                
                if (session.payment_status === 'paid') {
                    // Find the transaction
                    const transaction = await transactionModel.findOne({
                        stripeSessionId: session.id
                    });
                    
                    if (transaction && transaction.status === 'pending') {
                        // Add credits to user account
                        await addCredits(
                            transaction.userId,
                            transaction.credits,
                            transaction.amount,
                            session.id,
                            transaction.description
                        );
                        
                        // Update transaction status
                        transaction.status = 'completed';
                        transaction.stripePaymentIntentId = session.payment_intent;
                        await transaction.save();
                        
                        console.log(`Payment completed for user ${transaction.clerkId}: ${transaction.credits} credits`);
                    }
                }
                break;
                
            case 'checkout.session.expired':
                const expiredSession = event.data.object;
                
                // Mark transaction as cancelled
                const expiredTransaction = await transactionModel.findOne({
                    stripeSessionId: expiredSession.id
                });
                
                if (expiredTransaction && expiredTransaction.status === 'pending') {
                    expiredTransaction.status = 'cancelled';
                    await expiredTransaction.save();
                    console.log(`Payment session expired for transaction ${expiredTransaction._id}`);
                }
                break;
                
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                
                // Mark transaction as failed
                const failedTransaction = await transactionModel.findOne({
                    stripePaymentIntentId: failedPayment.id
                });
                
                if (failedTransaction) {
                    failedTransaction.status = 'failed';
                    await failedTransaction.save();
                    console.log(`Payment failed for transaction ${failedTransaction._id}`);
                }
                break;
                
            default:
                console.log(`Unhandled Stripe event type: ${event.type}`);
        }
        
        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });
        
    } catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed',
            error: error.message
        });
    }
});

// Get payment history for user
export const getPaymentHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const user = req.user;
    
    const payments = await transactionModel
        .find({ 
            userId: user._id, 
            type: 'credit_purchase',
            status: { $in: ['completed', 'failed', 'cancelled'] }
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v');
    
    const total = await transactionModel.countDocuments({ 
        userId: user._id, 
        type: 'credit_purchase',
        status: { $in: ['completed', 'failed', 'cancelled'] }
    });
    
    res.status(200).json({
        success: true,
        message: 'Payment history retrieved successfully',
        data: {
            payments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalPayments: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }
    });
});


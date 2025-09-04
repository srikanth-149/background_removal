import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clerkId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['credit_purchase', 'credit_used', 'credit_refund'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    stripeSessionId: {
        type: String,
        default: null
    },
    stripePaymentIntentId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    description: {
        type: String,
        default: ''
    },
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ clerkId: 1, createdAt: -1 });
transactionSchema.index({ stripeSessionId: 1 });
transactionSchema.index({ type: 1, status: 1 });

const transactionModel = mongoose.model('Transaction', transactionSchema);

export default transactionModel;


import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clerkId: {
        type: String,
        required: true
    },
    originalImageUrl: {
        type: String,
        required: true
    },
    processedImageUrl: {
        type: String,
        default: null
    },
    originalFileName: {
        type: String,
        required: true
    },
    processedFileName: {
        type: String,
        default: null
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['uploading', 'processing', 'completed', 'failed'],
        default: 'uploading'
    },
    processingTime: {
        type: Number, // in milliseconds
        default: null
    },
    errorMessage: {
        type: String,
        default: null
    },
    creditsUsed: {
        type: Number,
        default: 1
    },
    cloudinaryPublicId: {
        type: String,
        default: null
    },
    cloudinaryProcessedPublicId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for faster queries
imageSchema.index({ userId: 1, createdAt: -1 });
imageSchema.index({ clerkId: 1, createdAt: -1 });
imageSchema.index({ status: 1 });

const imageModel = mongoose.model('Image', imageSchema);

export default imageModel;


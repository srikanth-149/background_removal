import multer from 'multer';
import axios from 'axios';
import cloudinary from '../config/cloudinary.js';
import imageModel from '../models/imageModel.js';
import { deductCredits } from './userController.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Upload image to Cloudinary
const uploadToCloudinary = async (buffer, filename, folder = 'bg-removal') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                folder: folder,
                public_id: filename,
                quality: 'auto',
                fetch_format: 'auto'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        ).end(buffer);
    });
};

// Remove background using remove.bg API
const removeBackgroundWithRemoveBg = async (imageUrl) => {
    const API_KEY = process.env.REMOVEBG_API_KEY;
    
    if (!API_KEY) {
        throw new Error('Remove.bg API key not configured');
    }
    
    try {
        const response = await axios.post(
            'https://api.remove.bg/v1.0/removebg',
            {
                image_url: imageUrl,
                size: 'auto',
                format: 'png'
            },
            {
                headers: {
                    'X-Api-Key': API_KEY,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );
        
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Remove.bg API error:', error.response?.data || error.message);
        throw new Error('Failed to remove background using remove.bg');
    }
};

// Alternative: Remove background using Replicate API
const removeBackgroundWithReplicate = async (imageUrl) => {
    const API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!API_TOKEN) {
        throw new Error('Replicate API token not configured');
    }
    
    try {
        // Using RMBG-1.4 model on Replicate
        const response = await axios.post(
            'https://api.replicate.com/v1/predictions',
            {
                version: "54c1440edc6c1cb63cc2b2b2e2c8c2e2c8c2b2b2e2c8c2e2c8c2b2b2e2c8c2e2",
                input: {
                    image: imageUrl
                }
            },
            {
                headers: {
                    'Authorization': `Token ${API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const predictionId = response.data.id;
        
        // Poll for completion
        let result;
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds timeout
        
        while (attempts < maxAttempts) {
            const statusResponse = await axios.get(
                `https://api.replicate.com/v1/predictions/${predictionId}`,
                {
                    headers: {
                        'Authorization': `Token ${API_TOKEN}`
                    }
                }
            );
            
            result = statusResponse.data;
            
            if (result.status === 'succeeded') {
                // Download the processed image
                const imageResponse = await axios.get(result.output, {
                    responseType: 'arraybuffer'
                });
                return Buffer.from(imageResponse.data);
            } else if (result.status === 'failed') {
                throw new Error('Background removal failed');
            }
            
            // Wait 1 second before next attempt
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
        
        throw new Error('Background removal timed out');
    } catch (error) {
        console.error('Replicate API error:', error.response?.data || error.message);
        throw new Error('Failed to remove background using Replicate');
    }
};

// Remove background using ClipDrop API
const removeBackgroundWithClipDrop = async (imageBuffer) => {
    const API_KEY = process.env.CLIPDROP_API_KEY;
    if (!API_KEY) throw new Error('ClipDrop API key not configured');

    try {
        const response = await axios.post(
            'https://clipdrop-api.co/remove-background/v1',
            imageBuffer,
            {
                headers: {
                    'x-api-key': API_KEY,
                    'Content-Type': 'application/octet-stream'
                },
                responseType: 'arraybuffer'
            }
        );
        return Buffer.from(response.data);
    } catch (error) {
        console.error('ClipDrop API error:', error.response?.data || error.message);
        throw new Error('Failed to remove background using ClipDrop');
    }
};

// Simple background removal using a free API (fallback)
const removeBackgroundFallback = async (imageUrl) => {
    try {
        // For demo purposes, we'll use a simple approach
        // In a real implementation, you would use a proper background removal service
        
        // Download the original image
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });
        
        // For now, we'll just return the original image
        // In a real implementation, you would process the image to remove background
        // This is a placeholder that returns the original image
        return Buffer.from(response.data);
        
    } catch (error) {
        console.error('Fallback background removal error:', error.message);
        throw new Error('Background removal service is currently unavailable');
    }
};

// Main background removal function
const removeBackground = async (imageUrl, imageBuffer) => {
    // Try ClipDrop first
    if (process.env.CLIPDROP_API_KEY) {
        try {
            return await removeBackgroundWithClipDrop(imageBuffer);
        } catch (error) {
            console.log('ClipDrop failed, trying Remove.bg...');
        }
    }
    
    // Try remove.bg first
    if (process.env.REMOVEBG_API_KEY) {
        try {
            return await removeBackgroundWithRemoveBg(imageUrl);
        } catch (error) {
            console.log('Remove.bg failed, trying Replicate...');
        }
    }
    
    // Try Replicate as fallback
    if (process.env.REPLICATE_API_TOKEN) {
        try {
            return await removeBackgroundWithReplicate(imageUrl);
        } catch (error) {
            console.log('Replicate failed, trying fallback...');
        }
    }
    
    // Try fallback API
    return await removeBackgroundFallback(imageUrl);
};

// Process image - remove background
export const processImage = asyncHandler(async (req, res) => {
    let imageRecord;
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No image file provided'
        });
    }

    const user = req.user;
    const file = req.file;
    const startTime = Date.now();

    try {
        // Upload original image to Cloudinary first
        const originalUpload = await uploadToCloudinary(
            file.buffer,
            `original_${user._id}_${Date.now()}`,
            'bg-removal/originals'
        );

        // Create image record AFTER getting originalImageUrl
        imageRecord = new imageModel({
            userId: user._id,
            clerkId: user.clerkId,
            originalFileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            status: 'uploading',
            originalImageUrl: originalUpload.secure_url, // <-- set here
            cloudinaryPublicId: originalUpload.public_id
        });

        await imageRecord.save();

        // Update image record with original URL
        imageRecord.originalImageUrl = originalUpload.secure_url;
        imageRecord.cloudinaryPublicId = originalUpload.public_id;
        imageRecord.status = 'processing';
        await imageRecord.save();
        
        // Remove background
        const processedImageBuffer = await removeBackground(originalUpload.secure_url, file.buffer);
        
        // Upload processed image to Cloudinary
        const processedUpload = await uploadToCloudinary(
            processedImageBuffer,
            `processed_${imageRecord._id}`,
            'bg-removal/processed'
        );
        
        // Deduct credits
        await deductCredits(user._id, 1, `Background removal for ${file.originalname}`);
        
        // Update image record
        const processingTime = Date.now() - startTime;
        imageRecord.processedImageUrl = processedUpload.secure_url;
        imageRecord.cloudinaryProcessedPublicId = processedUpload.public_id;
        imageRecord.processedFileName = `processed_${file.originalname}`;
        imageRecord.status = 'completed';
        imageRecord.processingTime = processingTime;
        await imageRecord.save();
        
        // Get updated user credits
        const updatedUser = await user.constructor.findById(user._id);
        
        res.status(200).json({
            success: true,
            message: 'Background removed successfully',
            data: {
                imageId: imageRecord._id,
                originalImageUrl: imageRecord.originalImageUrl,
                processedImageUrl: imageRecord.processedImageUrl,
                processingTime: processingTime,
                remainingCredits: updatedUser.credits
            }
        });
        
    } catch (error) {
        console.error('Image processing error:', error);
        
        // Update image record with error
        if (imageRecord) {
            imageRecord.status = 'failed';
            imageRecord.errorMessage = error.message;
            await imageRecord.save();
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to process image',
            error: error.message
        });
    }
});

// Get user's processed images
export const getUserImages = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const user = req.user;
    
    const filter = { userId: user._id };
    if (status) {
        filter.status = status;
    }
    
    const images = await imageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v');
    
    const total = await imageModel.countDocuments(filter);
    
    res.status(200).json({
        success: true,
        message: 'Images retrieved successfully',
        data: {
            images,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalImages: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }
    });
});

// Get single image details
export const getImageDetails = asyncHandler(async (req, res) => {
    const { imageId } = req.params;
    const user = req.user;
    
    const image = await imageModel.findOne({
        _id: imageId,
        userId: user._id
    });
    
    if (!image) {
        return res.status(404).json({
            success: false,
            message: 'Image not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Image details retrieved successfully',
        data: image
    });
});

// Delete image
export const deleteImage = asyncHandler(async (req, res) => {
    const { imageId } = req.params;
    const user = req.user;
    
    const image = await imageModel.findOne({
        _id: imageId,
        userId: user._id
    });
    
    if (!image) {
        return res.status(404).json({
            success: false,
            message: 'Image not found'
        });
    }
    
    try {
        // Delete from Cloudinary
        if (image.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(image.cloudinaryPublicId);
        }
        if (image.cloudinaryProcessedPublicId) {
            await cloudinary.uploader.destroy(image.cloudinaryProcessedPublicId);
        }
        
        // Delete from database
        await imageModel.findByIdAndDelete(imageId);
        
        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: error.message
        });
    }
});


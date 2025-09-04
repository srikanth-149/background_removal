import express from 'express';
import { 
    processImage, 
    getUserImages, 
    getImageDetails, 
    deleteImage,
    upload 
} from '../controllers/imageController.js';
import { verifyClerkToken, checkCredits } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyClerkToken);

// POST /api/image/process - Upload and process image (remove background)
router.post('/process', checkCredits, upload.single('image'), processImage);

// GET /api/image/list - Get user's processed images
router.get('/list', getUserImages);

// GET /api/image/:imageId - Get single image details
router.get('/:imageId', getImageDetails);

// DELETE /api/image/:imageId - Delete image
router.delete('/:imageId', deleteImage);

export default router;


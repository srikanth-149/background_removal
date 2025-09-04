// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let error = {
        success: false,
        message: err.message || 'Internal Server Error',
        statusCode: err.statusCode || 500
    };

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(error => error.message);
        error.message = messages.join(', ');
        error.statusCode = 400;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error.message = `${field} already exists`;
        error.statusCode = 400;
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
        error.message = 'Invalid ID format';
        error.statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.statusCode = 401;
    }

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        error.message = 'File size too large';
        error.statusCode = 400;
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error.message = 'Unexpected file field';
        error.statusCode = 400;
    }

    // Stripe errors
    if (err.type === 'StripeCardError') {
        error.message = 'Payment failed: ' + err.message;
        error.statusCode = 400;
    }

    if (err.type === 'StripeInvalidRequestError') {
        error.message = 'Invalid payment request';
        error.statusCode = 400;
    }

    // Clerk errors
    if (err.status === 401 && err.message.includes('clerk')) {
        error.message = 'Authentication failed';
        error.statusCode = 401;
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// 404 handler
export const notFound = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};


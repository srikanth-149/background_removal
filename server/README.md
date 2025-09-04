# Background Removal SaaS Backend

A complete backend API for a Full Stack AI SaaS Background Removal App built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- 🔐 **Authentication**: Clerk integration for user management
- 💳 **Payments**: Stripe integration for credit purchases
- 🖼️ **Image Processing**: AI-powered background removal
- 📊 **Credit System**: Track and manage user credits
- 🗄️ **Database**: MongoDB with Mongoose ODM
- ☁️ **Cloud Storage**: Cloudinary for image storage
- 🔒 **Security**: JWT authentication and input validation
- 📝 **Logging**: Comprehensive error handling and logging

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **Payments**: Stripe
- **Image Storage**: Cloudinary
- **Image Processing**: Remove.bg / Replicate API
- **File Upload**: Multer

## Project Structure

```
server/
├── configs/
│   ├── mongodb.js          # MongoDB connection
│   └── cloudinary.js       # Cloudinary configuration
├── controllers/
│   ├── userController.js   # User management logic
│   ├── imageController.js  # Image processing logic
│   ├── paymentController.js # Payment handling
│   └── webhookController.js # Webhook handlers
├── middlewares/
│   ├── auth.js            # Authentication middleware
│   └── errorHandler.js    # Error handling middleware
├── models/
│   ├── userModel.js       # User schema
│   ├── imageModel.js      # Image schema
│   └── transactionModel.js # Transaction schema
├── routes/
│   ├── userRoutes.js      # User API routes
│   ├── imageRoutes.js     # Image API routes
│   ├── paymentRoutes.js   # Payment API routes
│   └── webhookRoutes.js   # Webhook routes
├── .env                   # Environment variables
├── package.json          # Dependencies
├── server.js             # Main server file
└── vercel.json           # Vercel deployment config
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Stripe Payments
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CURRENCY=USD

# Cloudinary (Image Storage)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# Background Removal APIs (Optional - choose one)
REMOVEBG_API_KEY=your_removebg_api_key
REPLICATE_API_TOKEN=your_replicate_api_token
PHOTOROOM_API_KEY=your_photoroom_api_key
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bg-removal-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in all required environment variables

4. **Start the development server**
   ```bash
   npm run server
   ```

   The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
All protected routes require a Bearer token in the Authorization header.

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/credits` - Get user credits
- `GET /api/user/transactions` - Get transaction history

### Image Processing
- `POST /api/image/process` - Upload and process image (requires credits)
- `GET /api/image/list` - Get user's processed images
- `GET /api/image/:imageId` - Get single image details
- `DELETE /api/image/:imageId` - Delete image

### Payments
- `GET /api/payment/packages` - Get available credit packages
- `POST /api/payment/create-checkout` - Create Stripe checkout session
- `POST /api/payment/success` - Handle successful payment
- `GET /api/payment/history` - Get payment history

### Webhooks
- `POST /api/webhook/clerk` - Clerk user events
- `POST /api/webhook/stripe` - Stripe payment events

## Credit System

- **New users**: Receive 5 free credits upon signup
- **Credit packages**:
  - Basic: 10 credits for $5.00
  - Standard: 25 credits for $10.00
  - Premium: 50 credits for $18.00
  - Enterprise: 100 credits for $30.00
- **Usage**: 1 credit per background removal

## Background Removal APIs

The system supports multiple background removal services:

1. **Remove.bg** (Primary)
   - High-quality results
   - Requires API key
   - Pay-per-use pricing

2. **Replicate** (Fallback)
   - RMBG-1.4 model
   - Good quality results
   - Requires API token

3. **PhotoRoom** (Demo/Fallback)
   - Free tier available
   - Basic background removal

## Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**

### Manual Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Webhook Configuration

### Clerk Webhooks
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy webhook secret to `CLERK_WEBHOOK_SECRET`

### Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/stripe`
3. Select events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

## Security Features

- JWT token verification
- Input validation and sanitization
- File upload restrictions
- Rate limiting (recommended for production)
- CORS configuration
- Webhook signature verification

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Development Mode
```bash
npm run server
```

This starts the server with nodemon for automatic restarts.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## Changelog

### v1.0.0
- Initial release
- User authentication with Clerk
- Stripe payment integration
- Background removal functionality
- Credit system implementation
- MongoDB integration
- Cloudinary image storage


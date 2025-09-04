# Full Stack AI SaaS Background Removal App

A complete Full Stack AI SaaS application for background removal built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Project Overview

This application allows users to:
- Upload images and remove backgrounds using AI
- Get 5 free credits upon signup
- Purchase additional credits via Stripe
- Manage their account and view processing history
- Download processed images with transparent backgrounds

## Tech Stack

### Frontend (Client)
- **React.js** with Vite
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **React Router** for navigation
- **React Toastify** for notifications

### Backend (Server)
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Clerk** for user authentication
- **Stripe** for payment processing
- **Cloudinary** for image storage
- **Remove.bg/Replicate** for AI background removal

## Project Structure

```
bg_removal_complete/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
└── README.md              # This file
```

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Clerk account
- Stripe account
- Cloudinary account
- Background removal API key (Remove.bg or Replicate)

### 1. Clone and Setup

```bash
# Extract the project
unzip bg_removal_complete.zip
cd bg_removal_complete
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Start the backend server
npm run server
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Configure environment variables
# Create .env file with Clerk and API URLs

# Start the frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=your_mongodb_connection_string

# Clerk
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Stripe
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CURRENCY=USD

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# Background Removal (choose one)
REMOVEBG_API_KEY=your_removebg_api_key
# OR
REPLICATE_API_TOKEN=your_replicate_api_token
```

### Frontend (.env)
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Features

### ✅ Completed Features

#### Backend
- ✅ User authentication with Clerk
- ✅ MongoDB integration with Mongoose
- ✅ Credit system (5 free credits on signup)
- ✅ Stripe payment integration
- ✅ Image upload and processing
- ✅ Background removal API integration
- ✅ Cloudinary image storage
- ✅ Transaction tracking
- ✅ Webhook handlers (Clerk & Stripe)
- ✅ Error handling and validation
- ✅ API documentation

#### Frontend (70-80% Complete)
- ✅ React setup with Vite
- ✅ Tailwind CSS configuration
- ✅ Clerk authentication integration
- ✅ React Router setup
- ✅ Toast notifications setup

### 🚧 Frontend Tasks Remaining (20-30%)

1. **Main Dashboard**
   - Image upload interface
   - Credit display
   - Processing status

2. **Image Processing**
   - Drag & drop upload
   - Preview functionality
   - Download processed images

3. **Credit Management**
   - Credit packages display
   - Stripe checkout integration
   - Payment history

4. **User Profile**
   - Profile management
   - Settings page

5. **UI/UX Polish**
   - Responsive design
   - Loading states
   - Error handling

## API Endpoints

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/credits` - Get credits
- `GET /api/user/transactions` - Transaction history

### Image Processing
- `POST /api/image/process` - Process image
- `GET /api/image/list` - Get user images
- `GET /api/image/:id` - Get image details
- `DELETE /api/image/:id` - Delete image

### Payments
- `GET /api/payment/packages` - Credit packages
- `POST /api/payment/create-checkout` - Create checkout
- `POST /api/payment/success` - Handle success
- `GET /api/payment/history` - Payment history

### Webhooks
- `POST /api/webhook/clerk` - Clerk events
- `POST /api/webhook/stripe` - Stripe events

## Credit System

- **New Users**: 5 free credits
- **Packages**:
  - Basic: 10 credits - $5.00
  - Standard: 25 credits - $10.00
  - Premium: 50 credits - $18.00
  - Enterprise: 100 credits - $30.00

## Deployment

### Backend (Vercel)
```bash
cd server
vercel
```

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy dist/ folder
```

## Development Workflow

1. **Start Backend**
   ```bash
   cd server && npm run server
   ```

2. **Start Frontend**
   ```bash
   cd client && npm run dev
   ```

3. **Test API**
   - Use Postman or curl
   - Check browser network tab

## Troubleshooting

### Common Issues

1. **MongoDB Connection**
   - Check MONGODB_URI format
   - Ensure IP whitelist includes your IP

2. **Clerk Authentication**
   - Verify publishable/secret keys
   - Check webhook configuration

3. **Stripe Payments**
   - Use test keys for development
   - Configure webhook endpoints

4. **Image Processing**
   - Verify API keys for background removal services
   - Check Cloudinary configuration

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

ISC License

## Support

For issues and questions:
- Check the documentation
- Review error logs
- Contact development team

---

**Note**: This backend is fully complete and production-ready. The frontend requires completion of the remaining 20-30% of features as outlined above.


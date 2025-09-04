import { Webhook } from 'svix';
import { createUserIfNotExists } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

// Clerk webhook handler
export const clerkWebhook = asyncHandler(async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
    }
    
    // Get the headers
    const headerPayload = req.headers;
    const svix_id = headerPayload['svix-id'];
    const svix_timestamp = headerPayload['svix-timestamp'];
    const svix_signature = headerPayload['svix-signature'];
    
    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({
            success: false,
            message: 'Error occurred -- no svix headers'
        });
    }
    
    // Get the body
    const body = req.body.toString();
    
    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);
    
    let evt;
    
    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return res.status(400).json({
            success: false,
            message: 'Error occurred while verifying webhook'
        });
    }
    
    // Handle the webhook
    const { id } = evt.data;
    const eventType = evt.type;
    
    console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
    console.log('Webhook body:', body);
    
    try {
        switch (eventType) {
            case 'user.created':
                const { id: clerkId, email_addresses, first_name, last_name } = evt.data;
                const email = email_addresses[0]?.email_address;
                
                if (!email || !first_name || !last_name) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required user data'
                    });
                }
                
                await createUserIfNotExists(clerkId, email, first_name, last_name);
                
                console.log(`User created successfully: ${email}`);
                break;
                
            case 'user.updated':
                // Handle user updates if needed
                console.log('User updated:', evt.data);
                break;
                
            case 'user.deleted':
                // Handle user deletion if needed
                console.log('User deleted:', evt.data);
                break;
                
            default:
                console.log(`Unhandled webhook event type: ${eventType}`);
        }
        
        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing webhook',
            error: error.message
        });
    }
});


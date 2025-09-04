import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    credits: {
        type: Number,
        default: 5 // 5 free credits on signup
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const userModel = mongoose.model('User', userSchema);

export default userModel;


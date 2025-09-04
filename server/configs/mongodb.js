import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("Database connected successfully");
        });

        mongoose.connection.on('error', (err) => {
            console.error("Database connection error:", err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log("Database disconnected");
        });

        await mongoose.connect(`${process.env.MONGODB_URI}/bgm`);
        console.log("MongoDB connection established");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;
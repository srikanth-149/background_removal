import mongoose from "mongoose";

const connectDB = async () =>{


   await mongoose.connection.on('connected', ()=>{
        console.log("database connnected")
    })


    await mongoose.connect(`${process.env.MONGODB_URI}/bgm`)

}

export default connectDB
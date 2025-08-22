import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
    clerkId : { type:String, required:true, unique:true},
    email: { type:String, required:true, unique:true },
    photo: { type:String,required:true},
    firstname: {type:String },
    lastname: {type:String},
    creditbalance : {type:Number,default:5}
})

const userModel = mongoose.models.user || MongoTopologyClosedError.model("user", userSchema)

export default userModel

import { Mongoose } from "mongoose";
import * as mongoose from 'mongoose';


const subscription = new Mongoose.Schema({
    subscriber:{
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    channel:{
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

},{timestamps:true})

export const Subscription = Mongoose.model('Subscription', subscription)


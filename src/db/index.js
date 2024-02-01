import mongoose from 'mongoose';
import {DB_NAME} from '../constants.js'

async function connectDb(){
    try {
        const response = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log('Database connected');
    } catch (error) {
        console.log("MongoDb Connection Failure :",error);
        process.exit(1);
    }
}

export default connectDb;
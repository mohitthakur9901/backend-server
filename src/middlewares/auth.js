import asynchandler from "../utils/asyncHandler.js";
import {apiError} from '../utils/apiError.js'
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";

const verfiyJWT = asynchandler(async (req, res, next) => {
    
    try {
        const token = req.cookies?.accessToken || req.headers?.('Authorization')?.split(" ")[1]
        if (!token) {
            throw new apiError(401,'Unauthorized')
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decoded?._id).select('-password -refreshToken');
        if (!user) {
            // TODO: frontend
            throw new apiError(401,'Unauthorized')
        }
        req.user = user;
        next() 
    } catch (error) {
        throw new apiError(401, 'Unauthorized')
    }
    
})

export {verfiyJWT}
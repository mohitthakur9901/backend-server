import mongoose from 'mongoose';
import {apiError} from '../utils/apiError.js'
import {ApiResponse } from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import { Tweet } from '../models/tweet.model.js';

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    const tweet = await Tweet.create({content, user: req.user._id});
    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    if (!mongoose.isValidObjectId(userId)) {
        throw new apiError(400, "Invalid user id");
    }
    const tweets = await Tweet.findById({owner:userId})
    if (!tweets) {
        throw new apiError(404, "No tweets found");
    }
    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"));

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body;
    const tweet = await Tweet.findByIdAndUpdate(
        {_id: tweetId},
        {$set: {content}},
        {new: true}
    )
    if (!tweet) {
        throw new apiError(404, "Tweet not found");
    }
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    const tweet = await Tweet.findByIdAndDelete({_id: tweetId})
    if (!tweet) {
        throw new apiError(404, "Tweet not found");
    }
    return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
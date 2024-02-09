import mongoose from 'mongoose';
import {apiError} from '../utils/apiError.js'
import {ApiResponse } from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import { Comment } from '../models/comment.model.js';


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    const comments = await Comment.aggregate([
        {$match: {video: mongoose.Types.ObjectId(videoId)}},
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $project:{
                content: 1,
                owner:{
                    _id: 1,
                    username: 1,
                },
                video:{
                    _id: 1,
                    title: 1
                }
            },
            createdAt: 1,
            updatedAt: 1,
        },
        {
            $skip: (page - 1) * limit,
        }
    ])
    if (!comments) {
        throw new apiError(404, "Comments not found")
    }
    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"))


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    if (!content) {
        throw new apiError(400, "Content is required")
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })
    await comment.save();
    return res.status(200).json(new ApiResponse(200, comment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    if (!content) {
        throw new apiError(400, "Content is required")
    }
    if (!commentId) {
        throw new apiError(400, "Comment id is required")
    }
    const comment = await Comment.findByIdAndUpdate(
        {_id: commentId},
        {$set: {content}},
        {new: true}
    )
    if (!comment) {
        throw new apiError(404, "Comment not found")
    }
    return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if (!commentId) {
        throw new apiError(400, "Comment id is required")
    }
    await Comment.findByIdAndDelete(
        {_id: commentId}
    )
    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
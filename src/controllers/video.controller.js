import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/ cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// still left work 
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const sortOrder = sortType === 'desc' ? -1 : 1;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  const videos = await Video.aggregate([
    {
       $match: { owner: mongoose.Types.ObjectId(userId) },
    },
    {
       $project: {
          videoFile: 1,
          thumbnail: 1,
          title: 1,
          description: 1,
          duration: 1,
          views: 1,
          owner: 1,
          isPublished: 1,
       },
    },
    {
       $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
       },
    },
    {
       $sort: sortOptions,
    },
    {
       $skip: (page - 1) * limit,
    },
    {
       $limit: parseInt(limit),
    },
    {
       $match: {
          $and: [
             { owner: mongoose.Types.ObjectId(userId) },
             query ? { title: { $regex: new RegExp(query, 'i') } } : {},
          ],
       },
    },
 ]);
  console.log(videos);
  return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
   // TODO: get video, upload to cloudinary, create video
  const { title, description } = req.body;
  if (!title || !description) {
    throw new apiError(400, "Title and description are required");
  }
  const videoFile = req.files.videoFile;
  const thumbnail = req.files.thumbnail;
  if (!videoFile || !thumbnail) {
    throw new apiError(400, "Video and thumbnail are required");
  }
  const video = await uploadOnCloudinary(videoFile, thumbnail);
  const newVideo = await Video.create({
    videoFile: video.videoFile,
    thumbnail: video.thumbnail,
    title,
    description,
    duration: video.duration,
    views:0,
    owner: req.user._id,
    isPublished: false,
  })
  await newVideo.save();
  return res.status(200).json(new ApiResponse(200, newVideo, "Video created successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new apiError(400, "Video id is required");
  }
  const video = await Video.findById({_id : videoId});
  if (!video) {
    throw new apiError(404, "Video not found");
  }
  return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new apiError(400, "Video id is required");
  }
  //TODO: update video details like title, description, thumbnail
  const updatedVideo = await Video.findByIdAndUpdate(
    { _id: videoId },
    { $set: req.body },
    { new: true }
  )
  if (!updatedVideo) {
    throw new apiError(404, "Video not found");
  }
  return res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
    
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new apiError(400, "Video id is required");
  }
  await Video.findByIdAndDelete({ _id: videoId });
  return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new apiError(400, "Video id is required");
  }
  const publishStatus = await Video.findByIdAndUpdate(
    { _id: videoId },
    { $set: { isPublished: !req.body.isPublished } },
    { new: true }
  )
  if (!publishStatus) {
    throw new apiError(404, "Video not found");
  }
  return res.status(200).json(new ApiResponse(200, publishStatus, "Publish status toggled successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

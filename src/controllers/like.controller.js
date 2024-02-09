import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const likedBy = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  if (likedBy) {
    await likedBy.remove();
    return res.status(200).json(ApiResponse.success(res, "Like removed"));
  }
  const like = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });
  await like.save();
  return res.status(200).json(ApiResponse.success(res, "Like added"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const likedBy = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });
  if (likedBy) {
    await likedBy.remove();
    return res.status(200).json(ApiResponse.success(res, "Like removed"));
  }
  const like = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });
  await like.save();
  return res.status(200).json(ApiResponse.success(res, "Like added"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const likedBy = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  if (likedBy) {
    await likedBy.remove();
    return res.status(200).json(ApiResponse.success(res, "Like removed"));
  }
  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  await like.save();
  return res.status(200).json(ApiResponse.success(res, "Like added"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideos = await Like.find({ likedBy: req.user._id });
  if (likedVideos) {
    return res.status(200).json(ApiResponse.success(res, likedVideos));
  }
  return res.status(200).json(ApiResponse.success(res, []));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
// like routes are left
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const likedBy = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (likedBy) {
    await likedBy.unliked();
    return res.json(new ApiResponse(200, res, "Like removed"));
  }

  const like = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  await like.save();
  return res.json(new ApiResponse(200, res, "Like added"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const likedBy = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (likedBy) {
    await likedBy.remove();
    return res.json(new ApiResponse(200, res, "Like removed"));
  }

  const like = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  await like.save();
  return res.json(new ApiResponse(200, res, "Like added"));
});


const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const likedBy = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (likedBy) {
    await likedBy.remove();
    return res.json(new ApiResponse(200, res, "Like removed"));
  }

  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  await like.save();
  return res.json(new ApiResponse(200, res, "Like added"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({ likedBy: req.user._id });

  if (likedVideos) {
    return res.json(new ApiResponse(200, res, likedVideos));
  }

  return res.json(new ApiResponse(200, res, []));
});



export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

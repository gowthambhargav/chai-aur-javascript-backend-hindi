import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const likedornot = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  if (likedornot) {
    await Like.deleteOne({ video: videoId, likedBy: req.user._id });
    return res.json(new ApiResponse(200, "Un liked video"));
  } else {
    const like = await Like.create({ video: videoId, likedBy: req.user._id });
    return res.json(new ApiResponse(200, like, "liked video"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!commentId) {
    throw new ApiError(400, "commentId is required");
  }
  const comment = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });
  if (comment) {
    await Like.deleteOne({ comment: commentId, likedBy: req.user._id });
    return res.json(new ApiResponse(200, "Un liked video"));
  } else {
    const comment = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    return res.json(new ApiResponse(200, comment, "liked video"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const comment = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  if (comment) {
    await Like.deleteOne({ tweet: tweetId, likedBy: req.user._id });
    return res.json(new ApiResponse(200, "Un liked tweet"));
  } else {
    const tweet = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    return res.json(new ApiResponse(200, tweet, "liked video"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideos = await Like.find({ likedBy: req.user?._id });
  if (likedVideos.length === 0) {
    res.json(new ApiResponse(200, "not liked any video"));
  }
  res.json(
    new ApiResponse(
      200,
      { count: likedVideos.length, likedVideos },
      "videos fetched sucessfully"
    )
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

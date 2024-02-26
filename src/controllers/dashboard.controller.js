import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const totalVideoViews = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $group: { _id: null, totalViews: { $sum: "$views" } },
    },
  ]);
  const totalSub = await Subscription.countDocuments({ channel: req.user._id });
  const totalVideos = await Video.countDocuments({ owner: req.user._id });
  const totalLikes = await Like.countDocuments({ likedBy: req.user._id });
  res.json(
    new ApiResponse(200, {
      totalVideoViews: totalVideoViews,
      totalSub,
      totalLikes,
      totalVideos,
    })
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const allVideos = await Video.aggregatePaginate({ owner: req.user?._id });
  if (allVideos.docs.length === 0) {
    res.json(new ApiResponse(200, "videos not found"));
  }
  res.json(new ApiResponse(200, allVideos, "videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };

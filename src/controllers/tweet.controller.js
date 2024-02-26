import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiError(401, "Content is Required");
  }
  const user = req.user?._id;
  const UserTweet = await Tweet.create({
    content,
    owner: user,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, UserTweet, "Tweet created Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!userId?.trim()) {
    throw new ApiError(400, "user id is missing");
  }
  // const userTweets = await Tweet.find({ owner: userId });
  const userTweets = await Tweet.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "views",
        localField: "_id",
        foreignField: "tweet",
        as: "views",
      },
    },
    {
      $addFields: {
        likeCount: { $size: "$likes" },
        viewCount: { $size: "$views" },
        isLiked: {
          $cond: {
            if: { $in: [req.user ? req.user._id : null, "$likes.userId"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        likes: 0,
        views: 0,
      },
    },
  ]);

  if (!userTweets) {
    throw new ApiError(400, "user dont have Tweets");
  }
  res
    .status(200)
    .json(new ApiResponse(200, userTweets, "user Tweet fetched Successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is missing");
  }
  if (!tweetId) {
    throw new ApiError(400, "tweetId is missing");
  }
  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: { content },
    },
    { new: true }
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, updatedTweet, "user Tweet Updated Successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "tweetId is missing");
  }
  const deletTweet = await Tweet.findByIdAndDelete(tweetId);
  res
    .status(200)
    .json(new ApiResponse(200, deletTweet, "user Tweet Deleted Successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };

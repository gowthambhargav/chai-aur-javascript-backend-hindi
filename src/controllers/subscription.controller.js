import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    // Check if the user is already subscribed to the channel
    const subscription = await Subscription.findOne({
      subscriber: userId,
      channel: channelId,
    });

    if (subscription) {
      // If the user is already subscribed, unsubscribe them
      await Subscription.deleteOne({ _id: subscription._id });
      res.json({ message: "Unsubscribed" });
    } else {
      // If the user is not subscribed, subscribe them
      await Subscription.create({ subscriber: userId, channel: channelId });
      res.json({ message: "Subscribed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "subscriberId id is required");
  }
  let newCId = new mongoose.Types.ObjectId(subscriberId);
  const ChannelSubscribers = await Subscription.aggregate([
    { $match: { channel: newCId } },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "totalsub",
      },
    },

    {
      $count: "totalsub",
    },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, ChannelSubscribers, "subscribed successfull"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "channelId is required");
  }
  const newobj = new mongoose.Types.ObjectId(channelId);
  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: newobj,
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "subscriber",
        as: "subs",
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        channel: 1,
        subs: 1,
        // username: 1,
        // email: 1,
        // avatar: 1,
      },
    },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, channels, "channels fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };

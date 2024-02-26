import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { GetDurationofVideo, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { [sortBy || "createdAt"]: sortType === "desc" ? -1 : 1 },
  };

  const filter = {};
  if (query) filter.title = { $regex: query, $options: "i" };
  if (userId) filter.owner = userId;

  const videos = await Video.aggregatePaginate(filter, options);

  // Send the videos
  res
    .status(201)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized Login to Access- user");
  }
  // TODO: get video, upload to cloudinary, create video

  if (!title && !description) {
    throw new ApiError(401, "title and description is required");
  }
  // TODO: check thumanel ,create let with the name ,and then if it exiest asign the path
  let videoFilelocalPath;
  const ThumanelLocalpath = req.files?.thumbnail[0]?.path;
  if (req.files && !ThumanelLocalpath && ThumanelLocalpath === undefined) {
    throw new ApiError(401, "thumanil is missing");
  }
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.videoFile.length > 0
  ) {
    videoFilelocalPath = req.files.videoFile[0].path;
  } else {
    throw new ApiError(401, "video is missing");
  }

  const UploadVideoTocloudanary = await uploadOnCloudinary(videoFilelocalPath);
  const UploadThumanalTocloudanary =
    await uploadOnCloudinary(ThumanelLocalpath);
  const user = User.findById(req.user?._id);

  if (!isValidObjectId(user._id)) {
    throw new ApiError(401, "user does not exist");
  }

  const publicId = UploadVideoTocloudanary.public_id;
  const duration = await GetDurationofVideo(publicId);
  const uploadVideo = await Video.create({
    videoFile: UploadVideoTocloudanary.url,
    thumbnail: UploadThumanalTocloudanary.url,
    title,
    description,
    owner: req.user._id,
    duration,
  });
  res
    .status(201)
    .json(new ApiResponse(200, uploadVideo, "Video Uploaded Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(401, "video id is required");
  }
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "Likes",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "Owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: { $size: "$subscribers" },
              isSubscribed: {
                $in: [
                  req.user ? req.user._id : null,
                  "$subscribers.subscriber",
                ],
              },
            },
          },
          {
            $project: {
              username: 1,
              avatar: 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$Likes",
        },
        owner: {
          $arrayElemAt: ["$Owner", 0],
        },
        isLiked: {
          $cond: {
            if: {
              $in: [req.user ? req.user._id : null, "$Likes.likedBy"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        videoFile: 1,
        owner: 1,
        title: 1,
        description: 1,
        views: 1,
        createdAt: 1,
        duration: 1,
        comments: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);
  await User.findByIdAndUpdate(req.user?._id, {
    $addToSet: {
      watchHistory: videoId,
    },
  });
  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
  if (!video) {
    throw new ApiError(401, "video id is not there");
  }
  res
    .status(201)
    .json(new ApiResponse(200, video[0], "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  if (!title && !description) {
    throw new ApiError(401, "Title and description is required");
  }
  const ThumanailLocalPath = req.file.path;
  if (!ThumanailLocalPath) {
    throw new ApiError(400, "Thumanail file is missing");
  }

  const thumanel = await uploadOnCloudinary(ThumanailLocalPath);
  if (!thumanel.url) {
    throw new ApiError(400, "Error while uploading on thumanel");
  }
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumanel.url,
      },
    },
    { new: true }
  );
  res
    .status(201)
    .json(new ApiResponse(200, video, "Video detials updated successfully"));
  // const UpdateThumnailImage = req.file.thumbnail;
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(401, "video id is required");
  }
  const video = await Video.findByIdAndDelete(videoId, { new: true });
  res
    .status(201)
    .json(new ApiResponse(200, video, "video Deleted successfuly"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId && isValidObjectId(videoId)) {
    throw new ApiError(401, "video id is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(401, `video doesnot exist with ${videoId}`);
  }
  video.isPublished = !video.isPublished;
  await video.save();
  res
    .status(201)
    .json(new ApiResponse(200, video, "togglePublishStatus successfuly"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

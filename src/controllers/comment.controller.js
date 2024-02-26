import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }
  const comments = await Comment.aggregatePaginate({ video: videoId }, options);
  res.json(new ApiResponse(200, comments));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "content is required");
  }
  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }
  const addComment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });
  res.json(new ApiResponse(200, addComment));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "content is required");
  }
  if (!commentId) {
    throw new ApiError(400, "commentId is required");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "invalied comment id");
  }
  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content: content },
    },
    { new: true }
  );
  res.json(new ApiResponse(200, updateComment, "updated comment"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "commentId is required");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "invalied comment id");
  }
  const deleteComment = await Comment.findByIdAndDelete(
    { _id: commentId },
    { new: true }
  );
  res.json(new ApiResponse(200, deleteComment, "deleted comment"));
});

export { getVideoComments, addComment, updateComment, deleteComment };

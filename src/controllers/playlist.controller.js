import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name && description) {
    throw new ApiError(401, "Title is required");
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });
  res
    .status(201)
    .json(new ApiResponse(200, playlist, "playlist created successfully"));

  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId) {
    throw new ApiError(401, "userid is required");
  }
  const playlistofUser = await Playlist.find({ owner: userId });
  res
    .status(201)
    .json(
      new ApiResponse(200, playlistofUser, "playlist fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(401, "playlistid is required");
  }
  const playlist = await Playlist.findOne({ _id: playlistId });
  if (!playlist) {
    throw new ApiError(401, "playlist not found");
  }
  res
    .status(201)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId && !videoId) {
    throw new ApiError(400, "playlist id and video is required");
  }
  const check = await Playlist.findById(playlistId);
  if (check.videos.includes(videoId)) {
    res.status(201).json(new ApiResponse(200, "video alredy exist"));
  }
  const Addvideoid = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    { new: true }
  );

  res
    .status(201)
    .json(new ApiResponse(200, Addvideoid, "video added Successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!playlistId && !videoId) {
    throw new ApiError(400, "playlist id and video is required");
  }
  const check = await Playlist.findById(playlistId);

  if (check.videos.includes(videoId)) {
    const RemoveVideo = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: {
          videos: videoId,
        },
      },
      { new: true }
    );
    res
      .status(201)
      .json(new ApiResponse(200, RemoveVideo, "video added Successfully"));
  } else {
    res
      .status(201)
      .json(new ApiResponse(200, "video doesnot exist in the playlist "));
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(401, "playlistid is required");
  }
  const playlist = await Playlist.findByIdAndDelete(playlistId, { new: true });
  if (!playlist) {
    res
      .status(400)
      .json(new ApiResponse(400, "playlist you are accessing is not exist"));
  }
  res
    .status(201)
    .json(new ApiResponse(200, playlist, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!playlistId) {
    throw new ApiError(401, "playlistid is required");
  }
  if (!name && !description) {
    throw new ApiError(401, "name and description is required");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );
  res
    .status(201)
    .json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};

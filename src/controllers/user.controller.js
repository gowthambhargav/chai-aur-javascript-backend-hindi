import { asyncHandler } from "../utils/asyncHandelet.js";
import { APiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  //   get user details from frontend
  // validation - not empty
  // check if user already exists : username email
  // check for images , check for avatar
  // upload them to cloudinary, avatar
  // creare user object - create entry in db
  //  remove password and refresh token field from response
  //  check for user creation
  // return res

  const { fullname, username, email, password } = req.body;
  //   if (fullname === "") {
  //     throw new APiError(400,"fullname is required")
  //   }
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new APiError(400, "All fields are required");
  }
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new APiError(409, "User with email or username already exists");
  }
  console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new APiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new APiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new APiError(500, "Something went wrong while regestring the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User regestered sucessfully"));
});

export { registerUser };

import { User } from "../models/user.model";
import { APiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandelet";
import jwt from "jsonwebtoken";

export const verfyJWT = asyncHandler(async (req, _, next) => {
  try {
    console.log(
      req.cookies,
      "from Auth Middleware",
      req.header("Authorization")
    );
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new APiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      // discuss about frontend
      throw new APiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new APiError(401, error.message || "Invalid access token");
  }
});

import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verfyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verfyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken); // if refreshAccessToken controler is writen in the different file , verfyJWT middleware is required
router.route("/change-password").post(verfyJWT, changeCurrentPassword);
router.route("/current-user").get(verfyJWT, getCurrentUser);
router.route("/update-account").patch(verfyJWT, updateAccountDetails);

router
  .route("/avatar")
  .patch(verfyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verfyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verfyJWT, getUserChannelProfile);
router.route("/history").get(verfyJWT, getWatchHistory);

export default router;

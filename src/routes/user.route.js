import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshActionToken,
  changeCurrentPassword,
  getCurrentUser,
  getUserChannel,
  getWatchHistory,
  updateUser,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verfiyJWT } from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/register",
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
router.post("/login", loginUser);

// secured routes
router.post("/logout", verfiyJWT, logoutUser);
router.post("/refresh", verfiyJWT, refreshActionToken);
router.post("/change-password", verfiyJWT, changeCurrentPassword);
router.get("/current-user", verfiyJWT, getCurrentUser);

router.get("/channel/:username", verfiyJWT, getUserChannel);

router.get("/watch-history", verfiyJWT, getWatchHistory);
router.patch("/update-account", verfiyJWT, updateUser);

// left to check
router.patch(
  "/update-avatar",
  verfiyJWT,
  upload.single("avatar"),
  updateUserAvatar
);
router.patch(
  "/update-cover-image",
  verfiyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);
router.get("/current-user", verfiyJWT, getCurrentUser);

export default router;

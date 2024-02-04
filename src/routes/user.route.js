import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshActionToken,
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

export default router;

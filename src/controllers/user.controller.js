import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/ cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asynchandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new apiError("Error generating tokens", 500);
  }
};

const options = {
  httpOnly: true,
  secure: true,
};

const registerUser = asynchandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  if (
    [username, email, fullName, password].some((field) => field.trim() === "")
  ) {
    throw new apiError("All fields are required", 400);
  }
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new apiError("User already exists", 409);
  }

  const avatarPathlocalPath = req.files?.avatar[0]?.path;
  if (!avatarPathlocalPath) {
    throw new apiError("Avatar is required", 400);
  }

  let coverImage;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
  }
  const avatar = await uploadOnCloudinary(avatarPathlocalPath);
  if (!avatar) {
    throw new apiError("Error uploading image", 500);
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  await user.save();

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new apiError("Error creating user", 500);
  }
  res
    .status(201)
    .json(new ApiResponse(createdUser, "User created successfully"));
});

const loginUser = asynchandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username && !email) {
      throw new apiError(400, "Username or email is required");
    }
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (!user) {
      throw new apiError(404, "User not found");
    }
    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
      throw new apiError("Invalid password", 401);
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const logoutUser = asynchandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: null,
          accessToken: null,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .clearCookie("refreshToken", options)
      .clearCookie("accessToken", options)
      .json(new ApiResponse(200, null, "User logged out successfully"));
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    throw new apiError(500, "Internal Server Error"); // Throw the error for the next middleware to handle it.
  }
});

const refreshActionToken = asynchandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new apiError(401, "Unauthorized");
    }
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded?._id);
    if (!user) {
      throw new apiError(401, "Unauthorized");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Token Is Expired or used");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, user, "Token refreshed successfully"));
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    throw new apiError(500, "Internal Server Error"); // Throw the error for the next middleware to handle it.
  }
});

const changeCurrentPassword = asynchandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw new apiError(404, "User not found");
    }
    const isMatch = await user.isPasswordCorrect(currentPassword);
    if (!isMatch) {
      throw new apiError(401, "Invalid current password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(new ApiResponse(200, null, "Password changed successfully"));
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    throw new apiError(500, "Internal Server Error"); // Throw the error for the next middleware to handle it.
  }
});

const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateUser = asynchandler(async (req, res) => {
  const { email, fullName } = req.body;
  if (!email || !fullName) {
    throw new apiError(400, "Email and fullName are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        email,
        fullName,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const updateUserAvatar = asynchandler(async (req, res) => {
  const avatarPathlocalPath = req.file?.path;
  if (!avatarPathlocalPath) {
    throw new apiError("Avatar is required", 400);
  }
  const avatar = await uploadOnCloudinary(avatarPathlocalPath);
  console.log(avatar);
  if (!avatar.url) {
    throw new apiError("Error uploading image", 500);
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  // delete previous avatar from cloudinary

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const updateUserCoverImage = asynchandler(async (req, res) => {
  const coverImagePathlocalPath = req.file?.path;
  if (!coverImagePathlocalPath) {
    throw new apiError("Cover image is required", 400);
  }
  const coverImage = await uploadOnCloudinary(coverImagePathlocalPath);
  console.log(coverImage);
  if (!coverImage.url) {
    throw new apiError("Error uploading image", 500);
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password");

  // delete previous cover image from cloudinary

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const getUserChannel = asynchandler(async (req, res) => {
  const { username } = req.params;
  console.log(username);
  try {
    if (!username?.trim()) {
      throw new apiError(400, "Username is missing in params");
    }
    const channel = await User.aggregate([
      { $match: { username: username } },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        }
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        }
      },
      {
        $addFields: {
          SubscriberCount: {
            $size: "$subscribers",
          },
          SubscribedToCount: {
            $size: "$subscribedTo",
          },
          isSubcribed: {
            $cond: {
              if: {
                $in: [req.user?._id, "$subscribers.subscriber"],
              },
              then: true,
              else: false,
            }
          }
        }
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          SubscriberCount: 1,
          SubscribedToCount: 1,
          isSubcribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
        }
      }
    ]);

    if (!channel?.length) {
      throw new apiError(404, "Channel not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, channel[0], "Channel fetched successfully"));
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getWatchHistory = asynchandler(async (req, res) => {
  console.log(req.user._id);
  const user = await User.aggregate([
    {
      $match: {
        _id: req.user._id
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                    coverImage: 1,
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              }
            }
          }
        ]
      }
    }
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, user[0], "User fetched successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshActionToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  updateUser,
  getUserChannel,
  getWatchHistory,
};

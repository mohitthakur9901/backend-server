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

export { registerUser, loginUser, logoutUser ,refreshActionToken};

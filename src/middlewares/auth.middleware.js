
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler( async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if (!token) {
            throw new ApiError(406, "Unauthorized access")
        }
        
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        
    
        const user = await User.findById(decodedToken?._id).select(" -password -refreshToken ")
    
        if (!user) {
            throw new ApiError(405, "Invalid access token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }


})

/*

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    if (!token) {
      throw new ApiError(401, "Unauthorized access"); // Use 401 Unauthorized status code
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error); // Log the error for debugging
    throw new ApiError(401, "Unauthorized access");
  }
});


*/

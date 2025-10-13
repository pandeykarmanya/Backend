import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId) => {
        try {
            const user = await User.findById(userId)
            const accessToken = user.generateAccessToken()
            const refreshToken = user.generateRefreshToken()

            user.refreshToken = refreshToken
            await user.save({ validateBeforeSave: false })

            return { accessToken, refreshToken }

        } catch (error) {
            throw new ApiError(500, "Something went wrong while generating tokens");
        }
    }

const registerUser = asyncHandler(async (req, res) => {

    const { fullname, username, email, password } = req.body;
    console.log("email: ", email);

    if (
        [fullname, username, email, password].some((field) => field?.trim() === "")
     ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ 
        $or: [{username}, {email}]
    });
    
    if (existedUser) {
        throw new ApiError(409, "Username or email already exists");
    }
    console.log(req.files);
    

    /* const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatarrr is required");
    } 

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar is required");
    }
    */

    const user = await User.create({
        fullname,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password  -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if ( !(username || email) ) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User not found with this username or email");
    }

    const isPassowrdValid = await user.isPasswordCorrect(password);

    if (!isPassowrdValid) {
        throw new ApiError(401, "invalid password");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                { 
                    user: loggedInUser, 
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { 
            $set: {
             refreshToken: undefined
             } 
        },
        { 
            new: true 
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})

export { registerUser,
            loginUser,
            logoutUser
 };


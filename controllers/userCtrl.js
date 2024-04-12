import User from "../model/User.js";
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import generateToken from "../utils/generateToken.js";
import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";

// @desc    Register User
// @route   POST /api/v1/users/register
// @access  Private/Admin

export const registerUserCtrl = asyncHandler(async(req, res) => {
    const { fullname, email, password }  = req.body;
    const userExists = await User.findOne({ email });
    if(userExists) {
        throw new Error ("User already exists");
    }else{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            fullname,
            email,
            password: hashedPassword,
        });
        res.status(201).json({
            status:'succsess',
            message:'User Registered Successfully',
            data: user,
        });
    }
});

// @desc   Login user 
// @route  POST /api/v1/users/login
// @access Public 

export const loginUserCtrl = asyncHandler(async(req, res) => {
    const { email, password } = req.body;
    const userFound = await User.findOne({
        email,
    });

    if (userFound && (await bcrypt.compare(password, userFound?.password))){
        res.json({
            status: "success",
            msg: "User Logged in succesfuly",
            userFound,
            token: generateToken(userFound?._id),
        });
    }else{
        throw new Error("invalid Login credintials");
}});

// @desc    Get user profile 
// @route   GET /api/v1/users/profile
// @accesss Private 
export const getUserProfileCtrl = asyncHandler(async(req,res) => {
    const user = await User.findById(req.userAuthId).populate("orders");

    res.json({
        status: "success",
        message: "User profile fetched successfully",
        user
    });
});

// @desc   Update user shipping address
// @route  PUT /api/users/update/shipping
// @access Private

export const updateShippingAddressCtrl = asyncHandler(async(req, res) => {
    const {firstName, lastName, Governate, Area, Block, Street, BuildingNumber, Phone} = req.body;
    const user = await User.findByIdAndUpdate(req.userAuthId, {
        shippingAddress: {
            firstName, lastName, Governate, Area, Block, Street, BuildingNumber, Phone
        },
        hasShippingAddress: true,
    },
    {
        new: true,
    });

    res.json({
        status: "success",
        message: "User shipping address updated successfully",
    });
});
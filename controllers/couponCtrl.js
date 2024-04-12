import asyncHandler from "express-async-handler";
import { notFound } from "../middlewares/globalErrHandler.js";
import Coupon from "../model/Coupon.js";


// @desc   Create new Coupon
// @route  POST /api/v1/coupons
// @access Private/Admin

export const createCouponCtrl = asyncHandler(async(req, res) => {
    const {code, startDate, endDate, discount} = req.body;
    const couponExists = await Coupon.findOne({
        code,
    });
    if (couponExists) {
        throw new Error("Coupon already exists");
    }
    if (isNaN(discount)){
        throw new Error("Discount value must be a number");
    }
    const coupon = await Coupon.create({
        code: code, 
        startDate, endDate, discount,
        user: req.userAuthId,
    });
    res.status(201).json({
        status: "success",
        message: "Coupon created succesfully",
        coupon,
    });
});


// @desc   Get all coupons 
// @route  GET /api/v1/coupons
// @access Private/Admin

export const getAllcouponsCtrl = asyncHandler(async(req, res) => {
    const coupons = await Coupon.find();

    res.status(200).json({
        status: "success",
        message: "All coupons",
        coupons,
    });
});


// @desc   Get single coupon
// @route  GET /api/v1/coupons/:id
// @access Private/Admin

export const getCouponCtrl = asyncHandler(async(req, res) => {
    const coupon = await Coupon.findOne({ code: req.body.code });

    //check if not not found
    if(coupon === null){
        throw new Error("Coupon not found");
    }
    //check if expired
    if(coupon.isExpired){
        throw new Error("Coupon Expired");
    }

    res.json({
        status: "success",
        message: "Coupon fetched",
        coupon,
    });
});

export const updateCouponCtrl = asyncHandler(async(req, res) => {
    const {code, startDate, endDate, discount} = req.body;
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, {
        code: code?.toUpperCase(),
        discount,
        startDate,
        endDate,
    },{
        new: true,
    });
    res.json({
        status: "success",
        message: "Coupon Updated successfully",
        coupon,
    });
});

export const deleteCouponCtrl = asyncHandler(async(req, res) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    res.json({
        status: "success",
        message: "Coupon deleted successfully",
        coupon,
    });
});
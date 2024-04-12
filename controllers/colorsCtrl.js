import Color from "../model/Color.js";
import asyncHandler from "express-async-handler";

// @desc   Create new color
// @route  Post /api/v1/color
// @access Private/Admin

export const createColorCtrl = asyncHandler(async(req, res)=>{
    const { name } = req.body;
      
    const colorFound = await Color.findOne({ name });
    if(colorFound){
        throw new Error("Color already exists");
    }

    const color = await Color.create({
      name: name.toLowerCase(),
      user: req.userAuthId,
    });

    res.json({
        status: "success",
        message: "Color created successfully",
        color
    });
});

// @desc   Get all colors
// @route  GET /api/colors
// @access Public

export const getAllColorsCtrl = asyncHandler(async(req, res)=>{

    const colors = await Color.find();

    res.json({
        status: "success",
        message: "Colors fetched successfully",
        colors
    });
});

// @desc   Get single color
// @route  GET /api/color/:id
// @access Public

export const getSingleColorCtrl = asyncHandler(async(req, res)=>{

    const color = await Color.findById(req.params.id);

    res.json({
        status: "success",
        message: "Color fetched successfully",
        color
    });
});

//@desc   update Color 
//@route  PUT /api/color/:id/update
//@access Public

export const updateColorCtrl = asyncHandler(async(req, res)=>{

    const { name } = req.body;

    const color = await Color.findByIdAndUpdate(req.params.id, {
        name
    },{
        new: true,
    });

    res.json({
        status: "success",
        message: "Color Updated successfully",
        color,
    });

});

//@desc   delete Color
//@route  DELETE /api/color/:id/delete
//@access Public

export const deleteColorCtrl = asyncHandler(async(req, res)=>{

    const color = await Color.findByIdAndDelete(req.params.id);

    res.json({
        status: "success",
        message: "Color Deleted successfully",
    });

});
import Brand from "../model/Brand.js";
import asyncHandler from "express-async-handler";

// @desc   Create new brand
// @route  Post /api/v1/brand
// @access Private/Admin

export const createBrandCtrl = asyncHandler(async(req, res)=>{
    const { name } = req.body;
      
    const brandFound = await Brand.findOne({ name });
    if(brandFound){
        throw new Error("Brand already exists");
    }

    const brand = await Brand.create({
      name: name.toLowerCase(),
      user: req.userAuthId,
    });

    res.json({
        status: "success",
        message: "Brand created successfully",
        brand
    });
});

// @desc   Get all brands
// @route  GET /api/brands
// @access Public

export const getAllBrandsCtrl = asyncHandler(async(req, res)=>{

    const brands = await Brand.find();

    res.json({
        status: "success",
        message: "brands fetched successfully",
        brands
    });
});

// @desc   Get single brand
// @route  GET /api/brand/:id
// @access Public

export const getSingleBrandCtrl = asyncHandler(async(req, res)=>{

    const brand = await Brand.findById(req.params.id);

    res.json({
        status: "success",
        message: "Brand fetched successfully",
        brand
    });
});

//@desc   update Brand 
//@route  PUT /api/brand/:id/update
//@access Public

export const updateBrandCtrl = asyncHandler(async(req, res)=>{

    const { name } = req.body;

    const brand = await Brand.findByIdAndUpdate(req.params.id, {
        name
    },{
        new: true,
    });

    res.json({
        status: "success",
        message: "Brand Updated successfully",
        brand,
    });

});

//@desc   delete Brand
//@route  DELETE /api/brand/:id/delete
//@access Public

export const deleteBrandCtrl = asyncHandler(async(req, res)=>{

    const brand = await Brand.findByIdAndDelete(req.params.id);

    res.json({
        status: "success",
        message: "Brand Deleted successfully",
    });

});
import Category from "../model/Category.js";
import asyncHandler from "express-async-handler";

// @desc   Create new category
// @route  Post /api/v1/category
// @access Private/Admin

export const createCategoryCtrl = asyncHandler(async(req, res)=>{
    const { name } = req.body;
      
    const categoryFound = await Category.findOne({ name });
    if(categoryFound){
        throw new Error("Category already exists");
    }

    const category = await Category.create({
      name: name.toLowerCase(),
      user: req.userAuthId,
      image: req.file.path,
    });

    res.json({
        status: "success",
        message: "Category created successfully",
        category
    });
});

// @desc   Get all categories
// @route  GET /api/categories
// @access Public

export const getAllCategoriesCtrl = asyncHandler(async(req, res)=>{

    const categories = await Category.find();

    res.json({
        status: "success",
        message: "Categories fetched successfully",
        categories
    });
});

// @desc   Get single category
// @route  GET /api/category/:id
// @access Public

export const getSingleCategoryCtrl = asyncHandler(async(req, res)=>{

    const category = await Category.findById(req.params.id);

    res.json({
        status: "success",
        message: "Category fetched successfully",
        category
    });
});

//@desc   update category 
//@route  PUT /api/category/:id/update
//@access Public

export const updateCategoryCtrl = asyncHandler(async(req, res)=>{

    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(req.params.id, {
        name
    },{
        new: true,
    });

    res.json({
        status: "success",
        message: "Category Updated successfully",
        category,
    });

});

//@desc   delete category
//@route  DELETE /api/category/:id/delete
//@access Public

export const deleteCategoryCtrl = asyncHandler(async(req, res)=>{

    const category = await Category.findByIdAndDelete(req.params.id);

    res.json({
        status: "success",
        message: "Category Deleted successfully",
    });

});
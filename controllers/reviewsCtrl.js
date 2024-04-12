import Product from "../model/Product.js";
import Review from "../model/Review.js";
import asyncHandler from "express-async-handler";

// @desc   Create new review
// @route  Post /api/v1/reviews
// @access Private/Admin

export const createReviewCtrl = asyncHandler(async (req, res)=>{
    const {product, message, rating} = req.body;
    const { productID } = req.params;
    const productFound = await Product.findById(productID).populate("reviews");

    if(!productFound){
        throw new Error("Product Not Found");
    }

    const hasReviewed = productFound?.reviews?.find((review)=>{
        return review?.user?.toString() === req?.userAuthId?.toString(); 
    });

    if(hasReviewed){
        throw new Error("You have already reviewed this product");
    }

    const review = await Review.create({
        message,
        rating,
        product: productFound?._id,
        user: req.userAuthId,
    });

    productFound.reviews.push(review?._id);
    await productFound.save();

    res.status(201).json({
        success: true,
        message: "Review created successfully",
    });
});
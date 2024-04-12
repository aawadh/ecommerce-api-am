import asyncHandler from "express-async-handler";
import Product from "../model/Product.js";
import Category from "../model/Category.js";
import Brand from  "../model/Brand.js";

//@desc   Create new product
//@route  Post /api/v1/products
//@access Private/Admin

export const createProductCtrl = asyncHandler(async(req,res)=>{
    const { name, description, category, brand, sizes, colors, user, price, totalQty } = req.body;
    
    const productExists = await Product.findOne({ name });
    if(productExists){
        throw new Error("Product already Exists");
    }else{

        const categoryFound = await Category.findOne({ name: category });
        const brandFound = await Brand.findOne({ name: brand });

        if(!categoryFound){
            throw new Error("Category not found, please create category first or check category name");
        }
        if(!brandFound){
            throw new Error("Brand not found, please create brand first or check brand name");
        }

        const product = await Product.create({
            name, 
            description, 
            brand,
            category, 
            sizes, 
            colors, 
            user: req.userAuthId, 
            price, 
            totalQty,
            images: req.files.map(file => file.path),
        });

        categoryFound.products.push(product._id);
        brandFound.products.push(product._id);

        await categoryFound.save();
        await brandFound.save();

        res.json({
            status: "success",
            message: "Product created successfully",
            product,
        });
    }
});

//@desc   Get all products
//@route  GET /api/v1/products
//@access Public

export const getProductsCtrl = asyncHandler(async(req,res)=>{
    let productQuery = Product.find();

    if (req.query.name){
        productQuery = productQuery.find({
            name: { $regex: req.query.name, $options: "i" },
        });
    }

    if (req.query.brand){
        productQuery = productQuery.find({
            brand: { $regex: req.query.brand, $options: "i" },
        });
    }

    if (req.query.category){
        productQuery = productQuery.find({
            category: { $regex: req.query.category, $options: "i" },
        });
    }

    if (req.query.colors){
        productQuery = productQuery.find({
            colors: { $regex: req.query.colors, $options: "i" },
        });
    }

    if (req.query.sizes){
        productQuery = productQuery.find({
            sizes: { $regex: req.query.sizes, $options: "i" },
        });
    }

    if (req.query.price){
        const priceRange = req.query.price.split("-");
        productQuery = productQuery.find({
            price: {$gte: priceRange[0], $lte: priceRange[1] },
        });
    }

    const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;

    const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;

    const startIndex = (page -1) * limit;

    const endIndex = page * limit;

    const total = await Product.countDocuments();

    productQuery = productQuery.skip(startIndex).limit(limit);

    const pagination = {};
    if (endIndex < total){
        pagination.next = {
            page: page + 1,
            limit,
        };
    }

    if (startIndex > 0){
        pagination.prev = {
            page: page - 1,
            limit,
        };
    }

    const products = await productQuery.populate('reviews');

    res.json({
        status: "success",
        total,
        reults: products.length,
        pagination,
        message: "Products fetched successfully",
        products,
    });
});

//@desc   update product
//@route  GET /api/products/:id/update
//@access Private/Admin

export const getProductCtrl = asyncHandler(async(req, res)=>{

    const product = await Product.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "user",
            select: "fullname",
        },
    });

    if(!product){
        throw new Error("Product not found")
    }

    res.json({
        status: "success",
        message: "Product Fetch successfully",
        product,
    });

});

//@desc   update product 
//@route  PUT /api/products/:id/update
//@access Private/Admin

export const updateProductCtrl = asyncHandler(async(req, res)=>{

    const { name, description, category, brand, sizes, colors, user, price, totalQty } = req.body;

    const product = await Product.findByIdAndUpdate(req.params.id, {
        name, description, category, brand, sizes, colors, user, price, totalQty,
    },{
        new: true,
    });

    res.json({
        status: "success",
        message: "Product Updated successfully",
        product,
    });

});

//@desc   delete product
//@route  DELETE /api/products/:id/delete
//@access Private/Admin

export const deleteProductCtrl = asyncHandler(async(req, res)=>{

    const product = await Product.findByIdAndDelete(req.params.id);

    res.json({
        status: "success",
        message: "Product Deleted successfully",
    });

});
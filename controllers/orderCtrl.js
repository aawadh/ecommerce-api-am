import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import Stripe from "stripe";
import Order from "../model/Order.js";
import Product from "../model/Product.js";
import User from "../model/User.js";
import Coupon from "../model/Coupon.js";


//@desc   create orders
//@route  POST /api/v1/orders
//@access private

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_KEY);

export const createOrderCtrl = asyncHandler(async (req, res) => {
    // Get the coupon
    const { coupon } = req?.query;
    const couponFound = await Coupon.findOne({
        code: coupon?.toUpperCase(),
    })
    if(couponFound?.isExpired){
        throw new Error("Coupon has expired");
    }
    if(!couponFound){
        throw new Error("Coupon doesn't exists");
    }
    // Get Discount
    // const discount = couponFound?.discount / 100;
    // Get the payload (customer, orderItems, shippingAddress, totalPrice);
    const { orderItems, shippingAddress, totalPrice} = req.body;
    // Find The user
    const user = await User.findById(req.userAuthId);
    // Check if user has shipping address
    if(!user?.hasShippingAddress) {
        throw new Error("Please provide shipping address");
    }
    // Check if the order is not empty
    if(orderItems?.length <= 0){
       throw new Error("No OrderItems");
    }
    // Place/create order - save into DB
    const order = await Order.create({
       user: user?._id,
       orderItems,
       shippingAddress,
    //    totalPrice: couponFound ? totalPrice - totalPrice * discount : totalPrice,
    totalPrice,
    });
    //push order into user
    user.orders.push(order?._id);
    await user.save();
    // Update the product qty
    const products = await Product.find({ _id: { $in: orderItems } });
    orderItems?.map(async (order) => {
     const product = products?.find((product) => {
            return product?._id?.toString() === order?._id?.toString();
        });
        if(product){
        product.totalSold += Number(order.qty);
        }
        await product.save();
    });
    //push order into user
    user.orders.push(order?._id);
    await user.save();
    // Make payment (stripe)
    const convertedOrders = orderItems.map((item) => {
        return {
            price_data: {
                currency: "usd",
                product_data: {
                    name: item?.name,
                    description: item?.description,
                },
                unit_amount: item?.price * 100,
            },
            quantity: item?.qty,
        }
    })
    const session = await stripe.checkout.sessions.create({
        line_items: convertedOrders, 
        metadata: {
            orderId: JSON.stringify(order?._id),
        },
        mode: "payment",
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel"
    });
    res.send({ url: session.url });


});


// @desc   get all orders
// @route  GET /api/v1/orders
// @access private

export const getAllOrdersCtrl = asyncHandler(async (req, res) => {
    // Don't forget pagnation 
    const orders = await Order.find();
    res.json({
        success: true,
        message: "All orders",
        orders,
    });
});

// @desc   get single order
// @route  GET /api/v1/orders/:id
// @access private/admin

export const getSingleOrderCtrl = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const order = await Order.findById(id);

    res.status(200).json({
        success: true,
        message: "Single order",
        order,
    });
});

// @desc   update order 
// @route  PUT /api/v1/orders/update/:id
// @access private/admin

export const updateOrderCtrl = asyncHandler(async(req, res) => {
    const id = req.params.id;

    const updatedOrder = await Order.findByIdAndUpdate(id, {
        status: req.body.status,
    },{
        new: true,
    });
    res.status(200).json({
        success: true,
        message: "Order updated",
        updatedOrder,
    });
});

// @desc   get sales sum of orders
// @route  GET /api/v1/orders/sales/sum
// @access Private/Admin

export const getOrderStatsCtrl = asyncHandler(async(req, res) => {
    const orders = await Order.aggregate([{
        $group: {
            _id: null,
            minimumSale:{
                $min: "$totalPrice",
            },
            totalSales:{
                $sum: "$totalPrice",
            },
            maximumSale:{
                $max: "$totalPrice",
            },
            avgSale:{
                $avg: "$totalPrice",
            }
        },
    },
    ]);
    const date = new Date();
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const salesToday = await Order.aggregate([{
        $match: {
            createdAt:{
                $gte: today,
            },
        },
    },{
        $group:{
            _id: null,
            totalSales: {
                $sum: "$totalPrice",
            },
        },
    },
]);
    res.status(200).json({
        success: true,
        message: "Sum of orders",
        orders,
        salesToday
    })
});
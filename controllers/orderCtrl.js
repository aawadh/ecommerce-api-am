import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
dotenv.config();
import Order from "../model/Order.js";
import Product from "../model/Product.js";
import User from "../model/User.js";
import axios from 'axios';
import Coupon from "../model/Coupon.js";



//@desc create orders
//@route POST /api/v1/orders
//@access private

export const createOrderCtrl = asyncHandler(async (req, res) => {

  //Get the payload(customer, orderItems, shipppingAddress, totalPrice);
  const { orderItems, shippingAddress, totalPrice } = req.body;
  //console.log(req.body);
  //Find the user
  const user = await User.findById(req.userAuthId);
  //Check if user has shipping address
  if (!user?.hasShippingAddress) {
    throw new Error("Please provide shipping address");
  }
  //Check if order is not empty
  if (orderItems?.length <= 0) {
    throw new Error("No Order Items");
  }
  //Place/create order - save into DB
  const order = await Order.create({
    user: user?._id,
    orderItems,
    shippingAddress,
    totalPrice,
  });

  //Update the product qty
  const products = await Product.find({ _id: { $in: orderItems } });

  orderItems?.map(async (order) => {
    const product = products?.find((product) => {
      return product?._id?.toString() === order?._id?.toString();
    });
    if (product) {
      product.totalSold += order.qty;
    }
    await product.save();
  });
  //push order into user
  user.orders.push(order?._id);
  await user.save();

  //make payment (Tap)
  //convert order items to have same structure that Tap need
  const convertedOrders = orderItems.map((item) => {
    return {
      price_data: {
        currency: "KWD",
        product_data: {
          name: item?.name,
          description: item?.description,
        },
        unit_amount: item?.price * 100,
      },
      quantity: item?.qty,
    };
  });

  const options = {
    method: 'POST',
    url: 'https://api.tap.company/v2/charges/',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: 'Bearer ' + process.env.TAP_TestSecretKey
    },
    data: {
      amount: totalPrice,
      currency: 'KWD',
      customer_initiated: true,
      threeDSecure: true,
      save_card: false,
      description: 'Test Description',
      metadata: {udf1: 'Metadata 1'},
      reference: {transaction: 'txn_01', order: order?._id},
      receipt: {email: true, sms: true},
      customer: {
        first_name: user.shippingAddress.firstName,
        middle_name: '',
        last_name: user.shippingAddress.lastName,
        email: 'aawadh73@gmail.com',
        phone: {country_code: 965, number: 65911176}
      },
      merchant: {id: process.env.TAP_MerchantID},
      source: {id: 'src_kw.knet'},
      post: {url: 'https://ecommerce-api-am-h3rh.onrender.com/api/v1/webhook'},
      redirect: {url: 'http://localhost:3000/success'}
    }
  };

  axios
    .request(options)
    .then(function (response) {
      res.send({ url: response.data.transaction.url });
    })
    .catch(function (error) {
      console.error(error);
    });
});


//@desc get all orders
//@route GET /api/v1/orders
//@access private

export const getAllordersCtrl = asyncHandler(async (req, res) => {
  //find all orders
  const orders = await Order.find().populate("user");
  res.json({
    success: true,
    message: "All orders",
    orders,
  });
});


//@desc get single order
//@route GET /api/v1/orders/:id
//@access private/admin

export const getSingleOrderCtrl = asyncHandler(async (req, res) => {
  //get the id from params
  const id = req.params.id;
  const order = await Order.findById(id);

  //send response
  res.status(200).json({
    success: true,
    message: "Single order",
    order,
  });
});


//@desc update order to delivered
//@route PUT /api/v1/orders/update/:id
//@access private/admin

export const updateOrderCtrl = asyncHandler(async (req, res) => {
  //get the id from params
  const id = req.params.id;
  
  //update
  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    success: true,
    message: "Order updated",
    updatedOrder,
  });
});


//@desc get sales sum of orders
//@route GET /api/v1/orders/sales/sum
//@access private/admin

export const getOrderStatsCtrl = asyncHandler(async (req, res) => {
  //get order stats
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        minimumSale: {
          $min: "$totalPrice",
        },
        totalSales: {
          $sum: "$totalPrice",
        },
        maxSale: {
          $max: "$totalPrice",
        },
        avgSale: {
          $avg: "$totalPrice",
        },
      },
    },
  ]);
  //get the date
  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const saleToday = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: today,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);
  //send response
  res.status(200).json({
    success: true,
    message: "Sum of orders",
    orders,
    saleToday,
  });
});

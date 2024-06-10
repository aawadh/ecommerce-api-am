import dotenv from "dotenv";
import cors from "cors";
import Stripe from "stripe";
dotenv.config();
import express, { response } from "express";
import axios from 'axios';
import path from "path";
import dbConnect from "../config/dbConnect.js";
import { globalErrhandler, notFound } from "../middlewares/globalErrHandler.js";
import brandsRouter from "../routes/brandsRouter.js";
import categoriesRouter from "../routes/categoriesRouter.js";
import colorRouter from "../routes/colorRouter.js";
import orderRouter from "../routes/ordersRouter.js";
import productsRouter from "../routes/productsRoute.js";
import reviewRouter from "../routes/reviewRouter.js";
import userRoutes from "../routes/usersRoute.js";
import Order from "../model/Order.js";
import couponsRouter from "../routes/couponsRouter.js";
import bodyParser from "body-parser";
import { sendPDFInvoice, sendOrderDetailsCustomer, sendOrderDetailsDeliveryManager } from "../utils/whatsapp.js";
import { convertToPDF } from "../utils/invoice.js";
import { invoiceUpload } from "../config/invoiceUpload.js";
import Product from "../model/Product.js";
import User from "../model/User.js";


const mytoken = process.env.MYTOKEN;

//db connect
dbConnect();
const app = express();
//cors
app.use(cors());

//pass incoming data
app.use(express.json());
//url encoded
app.use(express.urlencoded({ extended: true }));

//server static files
app.use(express.static("public"));
//routes
//Home route
app.get("/", (req, res) => {
  res.sendFile(path.join("public", "index.html"));
});

//Whatsapp Messaging
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

//Send Whatsapp message
app.post('/api/v1/sendMessage', (req, response) => {
  //sendOrderDetailsCustomer('العميل','1234','60','امين');
  const htmlContent = {
    Name: "العميل",
    Phone: "65911176",
    orderId: "123456",
    Vendor: "Ameen",
    CreatedBy: "January 1, 2023",
    Due: "January 3, 2023",
    Address: {
      Area: "المنطقة",
      Block: "2",
      Street: "5",
      HouseNumber: "12",
      Governate: "المحافظة"
    },
    Products: [
      {
        name: "فستان",
        price: "10",
        qty: "2",
      },
      {
        name: "سترة",
        price: "30",
        qty: "3",
      },
      {
        name: "عباية",
        price: "20",
        qty: "1",
      },
    ],
    Total: "63",
  };

  let invoiceProducts = '';

  htmlContent.Products.map((item) => {
     invoiceProducts = invoiceProducts + `${item.name} ${item.price}، `
  });

   const invoiceAddress = `المنطقة: ${htmlContent.Address.Area} ، القطعة:، ${htmlContent.Address.Block} ، الشارع: ${htmlContent.Address.Street} ، منزل: ${htmlContent.Address.HouseNumber} ، المحافظة: ${htmlContent.Address.Governate}.`


 sendOrderDetailsDeliveryManager(htmlContent.orderId, htmlContent.Name, htmlContent.Phone, invoiceAddress, invoiceProducts, htmlContent.Total);

  //sendOrderDetailsDeliveryManager("123456", "العميل", "65911176", "المنطقة: المنطقة ، القطعة:، 2 ، الشارع: 5 ، منزل: 12 ، المحافظة: المحافظة.", "فستان 10 سترة 30عباية 20", "63");

  response.sendStatus(200);
});

//Whatsapp message webhook
app.get("/api/v1/WhatsappWebhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challange = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (mode && token) {

    if (mode === "subscribe" && token === mytoken) {
      res.status(200).send(challange);
    } else {
      res.status(403);
    }

  }

});

//Webhook Tap Payment
app.post("/api/v1/webhook", express.raw({ type: "application/json" }), async (request, response) => {

  //Find the user
  const order = await Order.findById(request.body.reference.order);

  //Find the user
  const user = await User.findById(order.user);

  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const invoiceProductItems = order.orderItems.map((item) => {
    return {
      name: item?.name,
      description: item?.description,
      price: item?.price * 100,
      quantity: item?.qty,
    };
  });

  const htmlContent = {
    Name: user.fullname,
    Phone: user.shippingAddress.phone,
    orderId: order?._id,
    Vendor: "Ameen",
    CreatedBy: today,
    Due: "January 3, 2023",
    Address: {
      Area: "Area",
      Block: "2",
      Street: "5",
      HouseNumber: "12",
      Governate: "Governate"
    },
    Products: invoiceProductItems,
    Total: order.totalPrice,
  };

  //find the order
  const orderUpdate = await Order.findByIdAndUpdate(
    request.body.reference.order,
    {
      totalPrice: request.body.amount,
      paymentMethod: request.body.source.payment_method,
      paymentStatus: request.body.status,
      chargeId: request.body.id,
      invoice: pdf,
    },
    {
      new: true,
    }
  );

  let invoiceProducts = '';

  htmlContent.Products.map((item) => {
     invoiceProducts = invoiceProducts + `${item.qty} من ${item.name} بسعر ${item.price}، `
  });

   const invoiceAddress = `المنطقة: ${htmlContent.Address.Area} ، القطعة:، ${htmlContent.Address.Block} ، الشارع: ${htmlContent.Address.Street} ، منزل: ${htmlContent.Address.HouseNumber} ، المحافظة: ${htmlContent.Address.Governate}.`

  if (paymentStatus === "CAPTURED") {
    //Send order details
    sendOrderDetailsCustomer(request.body.customer.first_name, request.body.reference.order, totalPrice, 'امين');
    sendOrderDetailsDeliveryManager(htmlContent.orderId, htmlContent.Name, htmlContent.Phone, invoiceAddress, invoiceProducts, htmlContent.Total);
  }
  response.sendStatus(200);
});

app.use("/api/v1/users/", userRoutes);
app.use("/api/v1/products/", productsRouter);
app.use("/api/v1/categories/", categoriesRouter);
app.use("/api/v1/brands/", brandsRouter);
app.use("/api/v1/colors/", colorRouter);
app.use("/api/v1/reviews/", reviewRouter);
app.use("/api/v1/orders/", orderRouter);
app.use("/api/v1/coupons/", couponsRouter);
//err middleware
app.use(notFound);
app.use(globalErrhandler);

export default app;

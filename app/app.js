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
import { sendPDFInvoice, sendOrderDetailsCustomer } from "../utils/whatsapp.js";


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
  sendOrderDetailsCustomer();
  response.sendStatus(200);
});

//Webhook Tap Payment
app.post("/api/v1/webhook", express.raw({ type: "application/json" }),async (request, response) => {
    //find the order
    const order = await Order.findByIdAndUpdate(
      request.body.reference.order,
      {
        totalPrice: 10,
        paymentMethod: request.body.source.payment_method,
        paymentStatus: request.body.status,
        chargeId: request.body.id,
      },
      {
        new: true,
      }
    );
    if (paymentStatus === "CAPTURED"){
      //Send order details
      sendOrderDetailsCustomer();
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

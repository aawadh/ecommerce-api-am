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

//Webhook Tap Payment
app.post("/api/v1/webhook", async (request, response) => {
  console.log("Webhook Received");
    console.log(request.body.source.payment_method);
    console.log(request.body.status);
    const { orderId } = request.body.reference.order;
    const paymentStatusa = request.body.status;
    const paymentMethoda = request.body.source.payment_method;
    const totalAmount = request.body.amount;
    const chargeIda = request.body.id;
    //find the order
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        totalPrice: totalAmount,
        paymentMethod: paymentMethoda,
        paymentStatus: paymentStatusa,
        chargeId: chargeIda,
      },
      {
        new: true,
      }
    );
  response.sendStatus(200);
})

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

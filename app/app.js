import dotenv from "dotenv";
import cors from "cors";
import express from 'express';
import dbConnect from '../config/dbConnect.js';
import Stripe from "stripe";
import userRoutes from "../route/usersRoute.js";
import productsRouter from "../route/productsRoute.js";
import categoriesRouter from "../route/categoriesRoute.js";
import brandsRouter from "../route/brandsRoute.js";
import colorsRouter from "../route/colorsRoute.js";
import reviewsRouter from "../route/reviewRoute.js";
import { globalErrHandler, notFound } from "../middlewares/globalErrHandler.js";
import orderRouter from "../route/ordersRouter.js";
import Order from "../model/Order.js";
import couponsRouter from "../route/couponsRouter.js";



dotenv.config();
dbConnect();

const app = express();

app.use(cors());

//Stripe webhook

const stripe = new Stripe(process.env.STRIPE_KEY);



// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_e2517382a4e2e6af54410b81542355c64e4ec3ee8a7c1712881b94d97fb004b3";

app.post('/webhook', express.raw({type: 'application/json'}), async(request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed'){
    const session = event.data.object;
    const { orderId } = session.metadata;
    const paymentStatus = session.payment_status;
    const paymentMethod = session.payment_method_types[0];
    const totalAmount = session.amount_total;
    const currency = session.currency;

    const order = await Order.findByIdAndUpdate(JSON.parse(orderId),{
        totalPrice: totalAmount / 100,
        currency, paymentMethod,paymentStatus,
    },
    {
        new: true,
    });
  }else{
    return;
  }

//   // Handle the event
//   switch (event.type) {
//     case 'payment_intent.succeeded':
//       const paymentIntentSucceeded = event.data.object;
//       // Then define and call a function to handle the event payment_intent.succeeded
//       break;
//     // ... handle other event types
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.use(express.json());

app.use("/api/v1/users/", userRoutes);
app.use("/api/v1/products/", productsRouter);
app.use("/api/v1/categories/", categoriesRouter);
app.use("/api/v1/brands/", brandsRouter);
app.use("/api/v1/colors/", colorsRouter);
app.use("/api/v1/reviews/", reviewsRouter);
app.use("/api/v1/orders/", orderRouter);
app.use("/api/v1/coupons/", couponsRouter);


app.use(notFound);
app.use(globalErrHandler);

export default app;
import exppress from "express";
import { createOrderCtrl, getAllOrdersCtrl, getOrderStatsCtrl, getSingleOrderCtrl, updateOrderCtrl } from "../controllers/orderCtrl.js";
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import isAdmin from '../middlewares/isAdmin.js';

const orderRouter = exppress.Router();

orderRouter.post('/', isLoggedIn, createOrderCtrl);
orderRouter.get('/', isLoggedIn, getAllOrdersCtrl);
orderRouter.get('/:id', isLoggedIn, getSingleOrderCtrl);
orderRouter.put('/update/:id', isLoggedIn, updateOrderCtrl);
orderRouter.get('/sales/stats', isLoggedIn, getOrderStatsCtrl);

export default orderRouter;
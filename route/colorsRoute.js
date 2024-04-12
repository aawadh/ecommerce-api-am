import exppress from "express";
import { createColorCtrl, getAllColorsCtrl ,getSingleColorCtrl, updateColorCtrl, deleteColorCtrl } from "../controllers/colorsCtrl.js";
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import isAdmin from '../middlewares/isAdmin.js';

const colorsRouter = exppress.Router();

colorsRouter.post("/", isLoggedIn, isAdmin, createColorCtrl);
colorsRouter.get("/", getAllColorsCtrl);
colorsRouter.get("/:id", getSingleColorCtrl);
colorsRouter.put("/:id", isLoggedIn, isAdmin, updateColorCtrl);
colorsRouter.delete("/:id/delete", isLoggedIn, isAdmin, deleteColorCtrl);

export default colorsRouter;

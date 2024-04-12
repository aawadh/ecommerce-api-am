import exppress from "express";
import categoryFileUpload from "../config/categoryUpload.js";
import { createCategoryCtrl, getAllCategoriesCtrl ,getSingleCategoryCtrl, updateCategoryCtrl, deleteCategoryCtrl } from "../controllers/categoriesCtrl.js";
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import isAdmin from '../middlewares/isAdmin.js';

const categoriesRouter = exppress.Router();

categoriesRouter.post("/", isLoggedIn, isAdmin, categoryFileUpload.single("file"), createCategoryCtrl);
categoriesRouter.get("/", getAllCategoriesCtrl);
categoriesRouter.get("/:id", getSingleCategoryCtrl);
categoriesRouter.put("/:id", isLoggedIn, isAdmin, updateCategoryCtrl);
categoriesRouter.delete("/:id/delete", isLoggedIn, isAdmin, deleteCategoryCtrl);

export default categoriesRouter;

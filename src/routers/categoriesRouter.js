import express from "express";
import {
  getAllCategories,
  getCategoryById,
} from "../models/categories-model/categoriesModel.js";
const router = express.Router();

router.get("/:_id?", async (req, res, next) => {
  try {
    const { _id } = req.params;
    const categories = _id
      ? await getCategoryById(_id)
      : await getAllCategories();
    res.json({
      status: "success",
      message: "categories returned",
      categories,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

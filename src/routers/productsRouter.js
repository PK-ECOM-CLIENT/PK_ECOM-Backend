import express from "express";
import {
  getAllProducts,
  getProductById,
  getselectedProducts,
} from "../models/products-model/productsModel.js";
const router = express.Router();
// get products
router.get("/:_id?", async (req, res, next) => {
  try {
    const { _id } = req.params;
    const products = _id ? await getProductById(_id) : await getAllProducts();
    res.json({
      status: "success",
      message: "products fetched",
      products,
    });
  } catch (error) {
    next(error);
  }
});
// get products relevant to a set of category
router.get("/categoriesfilter/:_cid", async (req, res, next) => {
  try {
    const { _cid } = req.params;
    const products = await getselectedProducts(_cid);
    res.json({
      status: "success",
      message: "products fetched",
      products,
    });
  } catch (error) {
    next(error);
  }
});
export default router;

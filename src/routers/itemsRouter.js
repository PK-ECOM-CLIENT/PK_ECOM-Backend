import express from "express";
import {
  getAllItems,
  getItemById,
  getItemsByProduct,
} from "../models/items-model/itemsModel.js";
const router = express.Router();
router.get("/:_iid?", async (req, res, next) => {
  try {
    const { _iid } = req.params;
    const items = _iid ? await getItemById(_iid) : await getAllItems();
    res.json({
      status: "success",
      message: "items fetched",
      items,
    });
  } catch (error) {
    next(error);
  }
});
// get items relevent to the passed product
router.get("/productfilter/:_id", async (req, res, next) => {
  try {
    const { _id } = req.params;
    const items = await getItemsByProduct(_id);
    res.json({
      status: "success",
      message: "items fetched",
      items,
    });
  } catch (error) {
    next(error);
  }
});
export default router;

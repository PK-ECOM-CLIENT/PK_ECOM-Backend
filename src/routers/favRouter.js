import express from "express";
import {
  addToFav,
  deleteFavItem,
  getAllFavItems,
} from "../models/fav-model/fav-model.js";
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { itemId, userId } = req.body;
    const result = await getAllFavItems(itemId, userId);
    result.length &&
      res.json({
        status: success,
        message: "fav items are returned",
        result,
      });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const result = await addToFav(req.body);
    result._id
      ? res.json({
          status: "success",
          message: "The item has been added as favourites",
        })
      : res.json({ status: "error", message: "request unsuccessfull" });
  } catch (error) {
    next(error);
  }
});
router.delete("/", async (req, res, next) => {
  try {
    const result = await deleteFavItem(req.body);
    result._id
      ? res.json({
          status: "success",
          message: "The item has been removed",
        })
      : res.json({
          status: "error",
          message: "Request unsuccessful",
        });
  } catch (error) {
    next(error);
  }
});
export default router;

import express from "express";
import {
  addToFav,
  deleteFavItem,
  getAllFavItems,
} from "../models/fav-model/fav-model.js";
import { userAuth } from "../middlewares/authMiddleware.js";
import { getItemById } from "../models/items-model/itemsModel.js";
const router = express.Router();

router.get("/", userAuth, async (req, res, next) => {
  try {
    const { _id } = req.userInfo;
    const favourites = await getAllFavItems(_id);
    const favs = [];

    for (const item of favourites) {
      const favItem = await getItemById(item.itemId);
      favs.push(favItem);
    }
    console.log(favs);
    favs.length &&
      res.json({
        status: "success",
        message: "favs items are returned",
        favs,
      });
  } catch (error) {
    next(error);
  }
});

router.post("/", userAuth, async (req, res, next) => {
  try {
    const { _id } = req.userInfo;
    const { itemId } = req.body;
    const result = await addToFav({ userId: _id, itemId });
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

import express from "express";
import {
  addToFav,
  deleteFavItem,
  getAllFavItems,
  updateFavItem,
} from "../models/fav-model/favModel.js";
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
      favItem?._id && favs.push(favItem);
    }
    favs.length >= 0 &&
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

    // Check if the item is already in the user's favorites
    const update = await updateFavItem(
      { itemId, userId: _id },
      { duplicate: true }
    );
    if (update?._id) {
      return res.json({
        status: "success",
        message: "The item is already in your favorites.",
      });
    } else {
      const result = await addToFav({ userId: _id, itemId });
      if (result._id) {
        res.json({
          status: "success",
          message: "The item has been added as favorites",
        });
      } else {
        res.json({ status: "error", message: "Request unsuccessful" });
      }
    }
    // If the item is not in the favorites, add it
  } catch (error) {
    next(error);
  }
});

router.delete("/:_iid", userAuth, async (req, res, next) => {
  try {
    const _iid = req.params._iid;
    const _id = req.userInfo;
    const result = await deleteFavItem({ userId: _id, itemId: _iid });
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

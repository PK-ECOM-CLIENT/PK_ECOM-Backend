import express from "express";
import {
  addToCart,
  deleteCartItem,
  getAllCartItems,
  updateCartItem,
} from "../models/cart-model/cartModel.js";
import { userAuth } from "../middlewares/authMiddleware.js";
import { getItemById } from "../models/items-model/itemsModel.js";
const router = express.Router();

router.get("/", userAuth, async (req, res, next) => {
  try {
    console.log(req.body);
    const { _id } = req.userInfo;
    const cartItems = await getAllCartItems(_id);
    const carts = [];
    for (const item of cartItems) {
      const cartItem = await getItemById(item.itemId);
      const parsedItem = JSON.parse(JSON.stringify(cartItem));
      if (parsedItem?._id) {
        parsedItem.count = item.count;
        parsedItem.filter = item.filter;
        carts.push(parsedItem);
      }
      console.log(carts);
    }
    carts.length >= 0 &&
      res.json({
        status: "success",
        message: "cart items are returned",
        carts,
      });
  } catch (error) {
    next(error);
  }
});

router.post("/", userAuth, async (req, res, next) => {
  try {
    const { _id } = req.userInfo;
    const { count, filter, itemId } = req.body;
    // Check if the item is already in the user's favorites
    const update = await updateCartItem(
      { itemId, userId: _id },
      { duplicate: true }
    );
    if (update?._id) {
      return res.json({
        status: "success",
        message: "The item is already in your cart.",
      });
    } else {
      const result = await addToCart({ userId: _id, count, filter, itemId });
      if (result._id) {
        res.json({
          status: "success",
          message: "The item has been added to cart",
        });
      } else {
        res.json({ status: "error", message: "Request unsuccessful" });
      }
    }
  } catch (error) {
    next(error);
  }
});
router.delete("/:_iid", userAuth, async (req, res, next) => {
  try {
    const _iid = req.params._iid;
    const _id = req.userInfo;
    const result = await deleteCartItem({ userId: _id, itemId: _iid });
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

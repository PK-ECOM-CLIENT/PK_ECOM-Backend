import cartSchema from "./cartSchema.js";
export const addToCart = (obj) => {
  return cartSchema(obj).save();
};

export const getAllCartItems = (_id) => {
  return cartSchema.find({ userId: _id });
};

export const deleteCartItem = (obj) => {
  return cartSchema.fineOneAndDelete(obj);
};
// update used to see if the item is already in the cart
export const updateCartItem = ({ itemId, userId }, { duplicate: value }) => {
  return favSchema.findOneAndUpdate({ itemId, userId }, { duplicate: value });
};

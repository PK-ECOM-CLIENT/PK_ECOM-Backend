import cartSchema from "./cartSchema.js";
export const addToCart = (obj) => {
  return cartSchema(obj).save();
};

export const getAllCartItems = (itemId, userId) => {
  return cartSchema.find({ id: itemId, userId });
};

export const deleteCartItem = (obj) => {
  return cartSchema.fineOneAndDelete(obj);
};

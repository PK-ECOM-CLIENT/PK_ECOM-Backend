import itemSchema from "./itemsSchema.js";

export const getAllItems = () => {
  return itemSchema.find();
};
export const getItemById = (_id) => {
  return itemSchema.findById(_id);
};

export const getItemsByProduct = (_id) => {
  return itemSchema.find({ productId: _id });
};

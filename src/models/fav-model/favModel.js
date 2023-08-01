import favSchema from "./favSchema.js";
export const addToFav = (obj) => {
  return favSchema(obj).save();
};

export const getAllFavItems = (_id) => {
  return favSchema.find({ userId: _id });
};
export const updateFavItem = ({ itemId, userId }, { duplicate: value }) => {
  return favSchema.findOneAndUpdate({ itemId, userId }, { duplicate: value });
};
export const deleteFavItem = (obj) => {
  return favSchema.findOneAndDelete(obj);
};

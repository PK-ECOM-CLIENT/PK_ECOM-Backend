import favSchema from "./favSchema.js";
export const addToFav = (obj) => {
  return favSchema(obj).save();
};

export const getAllFavItems = (itemId, userId) => {
  return favSchema.find({ id: itemId, userId });
};

export const deleteFavItem = (obj) => {
  return favSchema.fineOneAndDelete(obj);
};

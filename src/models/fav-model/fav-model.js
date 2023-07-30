import favSchema from "./favSchema.js";
export const addToFav = (obj) => {
  return favSchema(obj).save();
};

export const getAllFavItems = (_id) => {
  return favSchema.find({ userId: _id });
};

export const deleteFavItem = (obj) => {
  return favSchema.fineOneAndDelete(obj);
};

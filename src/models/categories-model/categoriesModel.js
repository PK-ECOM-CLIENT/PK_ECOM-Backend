import categoriesSchema from "./categoriesSchema.js";
// get one category
export const getCategoryById = (_id) => {
  return categoriesSchema.findById(_id);
};

// get all categories
export const getAllCategories = () => {
  return categoriesSchema.find();
};

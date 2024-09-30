import productSchema from "./productsSchema.js";

export const getAllProducts = () => {
  return productSchema.find();
};
export const getProductById = (_id) => {
  return productSchema.findById(_id);
};
// gives products relevant to an specific category
export const getselectedProducts = (_cid) => {
  return productSchema.find({ catId: _cid });
};

export const getsingleProduct = (filter) => {
  return productSchema.find(filter);
};






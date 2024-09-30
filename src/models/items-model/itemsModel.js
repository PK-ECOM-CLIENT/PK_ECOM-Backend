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
// checking price and count with quantity while authorizing the payment while purchasing
export const checkItemDetails = async (name, _id, price, count) => {
  try {
    // Find the product by its ID
    const product = await itemSchema.findById(_id);
    
    if (!product) {
      return { success: false, message: `${name} is not available anymore` };
    }

    // Check if the item status is inactive
    if (product.status === 'inactive') {
      return { success: false, message: `${name} is not available at the moment` };
    }

    // Check if the count matches the available stock
    const isCountValid = count <= product.quantity;
    if (!isCountValid) {
      return {
        success: false,
        message: `Available stock for ${name} is only ${product.quantity}`,
      };
    }

    // Check if the price matches
    const isPriceMatch = product.price === price;
    if (!isPriceMatch) {
      return {
        success: false,
        message: `Price didn't match for ${name}`,
      };
    }

    // If all conditions are satisfied, return success as true
    return { success: true, message: "Product details are valid" };
  } catch (error) {
    console.error("Error checking product details:", error);
    return {
      success: false,
      message: "An error occurred while checking product details",
    };
  }
};


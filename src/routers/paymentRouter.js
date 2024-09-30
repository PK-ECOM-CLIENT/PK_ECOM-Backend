import express from "express";
import stripe from "stripe";
import { userAuth } from "../middlewares/authMiddleware.js";
import { checkItemDetails } from "../models/items-model/itemsModel.js";

const stripeInitiation = stripe(process.env.STRIPE_SECRET);
const router = express.Router();

router.post("/",userAuth, async (req, res, next) => {
  try {
    const { products, deliveryCharge, gstRate } = req.body;

    // Validate each product's price and quantity asynchronously
    const validationResults = await Promise.all(
      products.map((item) =>
        checkItemDetails(item.name, item._id, item.price, item.count)
      )
    );

    // Check if any validation failed and return the specific error message
    const failedValidation = validationResults.find(
      (result) => !result.success
    );
    if (failedValidation) {
      // Send the error message to the frontend
      return res.status(400).json({
        status:"error",
        message: failedValidation.message
      });
    }

    // Calculate the total price of products without GST
    const totalPriceWithoutGST = products.reduce((acc, product) => {
      return acc + product.price * product.count;
    }, 0);

    // Calculate GST based on the total price
    const gstAmount = Math.ceil(gstRate * totalPriceWithoutGST);

    // Create line items for the products (without GST)
    const lineItems = products.map((product) => {
      return {
        price_data: {
          currency: "aud",
          product_data: {
            name: product.name,
            images: [product.thumbnail],
          },
          unit_amount: Math.round(product.price * 100), // Stripe accepts amounts in cents
        },
        quantity: product.count,
      };
    });

    // Adding GST as a separate line item
    lineItems.push({
      price_data: {
        currency: "aud",
        product_data: {
          name: "GST",
        },
        unit_amount: Math.ceil(gstAmount * 100), // Make sure it's in cents
      },
      quantity: 1, // GST is a single cost for the total
    });

    // Adding delivery charge as a separate line item if it exists
    if (deliveryCharge) {
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: "Delivery Charge",
          },
          unit_amount: Math.ceil(deliveryCharge * 100), // In cents
        },
        quantity: 1,
      });
    }

    // Creating the Stripe checkout session with the new line items
    const session = await stripeInitiation.checkout.sessions.create({
      payment_method_types: ["card", "afterpay_clearpay", "zip"],
      line_items: lineItems,
      billing_address_collection: "required", // Require billing address
      shipping_address_collection: {
        allowed_countries: ["AU"], // Specify allowed countries for shipping address
      },
      mode: "payment",
      success_url: process.env.ROOT_DOMAIN + "/paymentsuccessful",
      cancel_url: process.env.ROOT_DOMAIN + "/paymentfailed",
    });

    // Sending the session ID back to the client
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    next(error);
  }
});

export default router;

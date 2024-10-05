import express from "express";
import stripe from "stripe";
import { userAuth } from "../middlewares/authMiddleware.js";
import {
  checkItemDetails,
  decreaseItemQuantity,
} from "../models/items-model/itemsModel.js";

const stripeInitiation = stripe(process.env.STRIPE_SECRET);
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { products, deliveryCharge, gstRate } = req.body;
    console.log(products);
    // Validate each product's price and quantity asynchronously
    const validationResults = await Promise.all(
      products.map((item) =>
        checkItemDetails(item.name, item._id, item.price, item.count)
      )
    );

    const failedValidation = validationResults.find(
      (result) => !result.success
    );
    if (failedValidation) {
      return res.status(400).json({
        status: "error",
        message: failedValidation.message,
      });
    }

    const totalPriceWithoutGST = products.reduce((acc, product) => {
      return acc + product.price * product.count;
    }, 0);

    const gstAmount = Math.ceil(gstRate * totalPriceWithoutGST);

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "aud",
        product_data: {
          name: product.name,
          images: [product.thumbnail],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.count,
    }));

    lineItems.push({
      price_data: {
        currency: "aud",
        product_data: { name: "GST" },
        unit_amount: Math.ceil(gstAmount * 100),
      },
      quantity: 1,
    });

    if (deliveryCharge) {
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: { name: "Delivery Charge" },
          unit_amount: Math.ceil(deliveryCharge * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripeInitiation.checkout.sessions.create({
      payment_method_types: ["card", "afterpay_clearpay", "zip"],
      line_items: lineItems,
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["AU"] },
      mode: "payment",
      success_url: process.env.ROOT_DOMAIN + "/paymentsuccessful",
      cancel_url: process.env.ROOT_DOMAIN + "/paymentfailed",
    });
    console.log(session);

    // If the session is successfully created
    // if (session.id) {
    //   // Decrease the quantity of each product in the database
    //   await Promise.all(
    //     products.map(async (product) => {
    //       await decreaseItemQuantity(product._id, product.count);
    //     })
    //   );
    // }

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    next(error);
  }
});
export default router;

import express from "express";
import stripe from "stripe";
import { decreaseItemQuantity } from "./../models/items-model/itemsModel.js"; // Import your Mongoose function

const stripeWebhookInitiation = stripe(process.env.STRIPE_SECRET);
const router = express.Router();

// Webhook endpoint with raw middleware applied directly to this route
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      // Stripe needs the raw body to verify the webhook signature
      event = stripeWebhookInitiation.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET // Your webhook secret from Stripe dashboard
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed:`, err.message);
      return res.sendStatus(400);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // Log the session object to see its structure
        console.log("Session object:", session);

        // Check if display_items exists and is an array
        const products =
          session.display_items && Array.isArray(session.display_items)
            ? session.display_items.map((item) => ({
                _id: item.custom.id, // Ensure this ID corresponds to your product model
                count: item.quantity, // The quantity purchased
              }))
            : [];
        // If products are found, decrease the quantity in the database
        if (products.length > 0) {
          try {
            await Promise.all(
              products.map(async (product) => {
                await decreaseItemQuantity(product._id, product.count); // Call your Mongoose function here
              })
            );
            console.log("Product quantities have been updated successfully.");
          } catch (error) {
            console.error("Error updating product quantities: ", error);
          }
        } else {
          console.warn("No products found in the session.");
        }

        console.log("Payment was successful!", session);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Acknowledge receipt of the event
    res.sendStatus(200);
  }
);

export default router;

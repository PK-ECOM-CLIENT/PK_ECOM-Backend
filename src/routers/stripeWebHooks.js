import express from "express";
import stripe from "stripe";

const stripeWebhookInitiation = stripe(process.env.STRIPE_SECRET);
const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      // Stripe needs the raw body to verify the webhook signature
      event = stripeWebhookInitiation.webhooks.constructEvent(
        req.body, // Ensure this is the raw body
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed:`, err.message);
      return res.sendStatus(400);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // Retrieve line items from the session
        const lineItems =
          await stripeWebhookInitiation.checkout.sessions.listLineItems(
            session.id
          );

        // Process the line items
        const products = lineItems.data.map((item) => ({
          name: item.description,
          quantity: item.quantity,
          price: item.amount_total / 100, // Stripe amounts are in cents, convert to dollars
        }));

        const deliveryCharge =
          session.total_details?.amount_shipping / 100 || 0;
        const gst = session.total_details?.amount_tax / 100 || 0;

        console.log("Payment was successful!");
        console.log("Products: ", products);
        console.log("Delivery Charge: ", deliveryCharge);
        console.log("GST: ", gst);

        // Additional actions, like updating order status or sending an email
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

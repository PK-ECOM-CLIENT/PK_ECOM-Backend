import express from "express";
import stripe from "stripe";

const stripeWebhookInitiation = stripe(process.env.STRIPE_SECRET);
const router = express.Router();

// Webhook endpoint
router.post("/", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Stripe needs the raw body to verify the webhook signature
    event = stripeWebhookInitiation.webhooks.constructEvent(
      req.body, // raw body is passed here
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

      // Extract relevant details from session object
      const products = session.display_items.map((item) => ({
        name: item.custom.name,
        quantity: item.quantity,
        price: item.amount_total / 100, // Stripe amounts are in cents, convert to dollars
      }));

      const deliveryCharge = session.total_details.amount_shipping / 100;
      const gst = session.total_details.amount_tax / 100;

      // You can store or log these details, or use them to update your database
      console.log("Payment was successful!");
      console.log("Products: ", products);
      console.log("Delivery Charge: ", deliveryCharge);
      console.log("GST: ", gst);

      // Perform any additional actions, like updating order status or sending an email
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Acknowledge receipt of the event
  res.sendStatus(200);
});

export default router;

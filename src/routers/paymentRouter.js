import express from "express";
import stripe from "stripe";
const stripeInitiation = stripe(process.env.STRIPE_SECRET);
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { products, deliveryCharge, gstRate } = req.body;

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
          unit_amount: Math.ceil(deliveryCharge * 100), // Make sure it's in cents
        },
        quantity: 1, // Since delivery is a single cost
      });
    }

    // Creating the Stripe checkout session with the new line items
    const session = await stripeInitiation.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/",
      cancel_url:
        "http://localhost:3000/categories/64dac105487491a46c1b322b/products/64dac1f3487491a46c1b3712",
    });

    // Sending the session ID back to the client
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    next(error);
  }
});

export default router;

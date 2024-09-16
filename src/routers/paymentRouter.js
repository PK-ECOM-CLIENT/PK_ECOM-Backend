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
    // Creating the Stripe checkout session with the new line items
    const session = await stripeInitiation.checkout.sessions.create({
      payment_method_types: ["card", "afterpay_clearpay", "zip"],
      line_items: lineItems,
      billing_address_collection: "required", // Require billing address
      shipping_address_collection: {
        allowed_countries: ["AU"], // Specify allowed countries for shipping address
      },
      // If you want to add predefined shipping rates, you can use `shipping_options`
      shipping_options: deliveryCharge
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: {
                  amount: Math.ceil(deliveryCharge * 100),
                  currency: "aud",
                },
                display_name: "Standard Shipping",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 7 },
                  maximum: { unit: "business_day", value: 10 },
                },
              },
            },
          ]
        : undefined,
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

const express = require("express");
const router  = express.Router();
const stripe  = require("stripe")(process.env.STRIPE_SECRET_KEY);

// POST /api/payment/create-intent
// Body: { amount: number (in smallest currency unit, e.g. cents / paise), currency: string }
router.post("/create-intent", async (req, res) => {
  const { amount, currency = "lkr" } = req.body;   // LKR for Sri Lanka Rupees

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "A valid amount is required." });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),   // must be integer (paise/cents)
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
// checkoutSession.js

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeHandler = async (event) => {
  const { priceId } = event.body;

  console.log('whats the price id?', priceId)

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      ui_mode: 'embedded',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      return_url: `${event.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: session.client_secret }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // or specific origin
        "Access-Control-Allow-Headers": "Content-Type",      
      },
    };
  } catch (err) {

    console.log('There is an error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

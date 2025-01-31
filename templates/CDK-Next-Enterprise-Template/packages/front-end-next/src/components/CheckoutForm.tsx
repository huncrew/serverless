// components/CheckoutForm.tsx

import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export type PriceId = string;

type CheckoutFormProps = {
    priceId: PriceId;
  };

const CheckoutForm: React.FC<CheckoutFormProps>  = ({ priceId }) => {
  const fetchClientSecret = useCallback(async () => {
    console.log('function being called - fetchClient');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AWS_API_URL}/stripe-checkout`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });
  
      const data = await response.json();
      console.log('clientSecret:', data.clientSecret); // Log the clientSecret to check its value and type
      console.log('typeof', data.clientSecret);
  
      return data.clientSecret;
    } catch (error) {
      console.error('Error fetching clientSecret:', error);
      throw error; // Re-throw the error to ensure it's handled appropriately
    }
  }, [priceId]);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

export default CheckoutForm;

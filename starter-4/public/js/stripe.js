import axios from 'axios';
import { showAlert } from './alerts.js';
const stripe = Stripe(
  'pk_test_51MIyLKSGRkVz21jlD9y8yiplkFxdqi7fDb4gy8YnMd6Q9rbzO9f0X3oVgyzjj30BufhMGQqST1LabMzxDj4x6eVW00PYIJlTq1',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.error(err);
    showAlert(err);
  }
};

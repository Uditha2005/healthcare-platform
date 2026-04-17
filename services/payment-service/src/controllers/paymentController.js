const Stripe = require('stripe');
const Payment = require('../models/Payment');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeKeyConfigured = Boolean(
  stripeSecretKey &&
  stripeSecretKey.trim() &&
  !stripeSecretKey.includes('your_key')
);
const stripe = stripeKeyConfigured ? new Stripe(stripeSecretKey) : null;

const toMinorUnits = (amount) => Math.round(Number(amount) * 100);

exports.createPayment = async (req, res) => {
  try {
    const { appointmentId, doctorId, amount, currency = 'lkr' } = req.body;

    if (!appointmentId || !doctorId || !amount) {
      return res.status(400).json({ message: 'appointmentId, doctorId and amount are required' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    if (!stripe) {
      const mockIntentId = `mock_pi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const payment = await Payment.create({
        appointmentId,
        patientId: req.user.id,
        doctorId,
        amount: Number(amount),
        currency: currency.toLowerCase(),
        status: 'succeeded',
        stripePaymentIntentId: mockIntentId,
        metadata: {
          appointmentId,
          patientId: req.user.id,
          doctorId,
          mode: 'dev-no-stripe'
        }
      });

      return res.status(201).json({
        message: 'Payment recorded in development mode (Stripe not configured)',
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          stripePaymentIntentId: payment.stripePaymentIntentId,
          clientSecret: null
        }
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toMinorUnits(amount),
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        appointmentId,
        patientId: req.user.id,
        doctorId
      }
    });

    const payment = await Payment.create({
      appointmentId,
      patientId: req.user.id,
      doctorId,
      amount: Number(amount),
      currency: currency.toLowerCase(),
      status: paymentIntent.status,
      stripePaymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata
    });

    return res.status(201).json({
      message: 'Payment intent created',
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        clientSecret: paymentIntent.client_secret
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to create payment', error: err.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const paymentIntentId = req.query.paymentIntentId || req.params.paymentIntentId;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'paymentIntentId is required' });
    }

    if (!stripe) {
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      return res.status(200).json({
        paymentIntentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        localRecord: payment
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { status: paymentIntent.status },
      { new: true }
    );

    return res.status(200).json({
      paymentIntentId,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      localRecord: payment
    });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to fetch payment status', error: err.message });
  }
};

exports.handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ message: 'STRIPE_WEBHOOK_SECRET is not configured' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    const mappedStatus = event.type === 'payment_intent.payment_failed' ? 'failed' : intent.status;

    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      { status: mappedStatus }
    );
  }

  return res.status(200).json({ received: true });
};

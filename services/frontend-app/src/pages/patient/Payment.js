import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';

const DEFAULT_AMOUNT = 2500;

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const appointmentPayload = location.state?.appointmentPayload;
  const doctor = location.state?.doctor;

  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    amount: DEFAULT_AMOUNT
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const isValidCardNumber = (cardNumber) => cardNumber.replace(/\s/g, '').length >= 12;

  const handlePay = async (e) => {
    e.preventDefault();

    if (!appointmentPayload?.doctorId) {
      toast.error('Appointment details not found. Please book again.');
      navigate('/patient/book-appointment');
      return;
    }

    if (!paymentForm.cardName || !isValidCardNumber(paymentForm.cardNumber) || !paymentForm.expiry || paymentForm.cvv.length < 3) {
      toast.error('Please enter valid payment credentials');
      return;
    }

    if (Number(paymentForm.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const appointmentRes = await API.post('/appointment', appointmentPayload);
      const appointmentId = appointmentRes.data?.appointment?._id || appointmentRes.data?.appointment?.id;

      if (!appointmentId) {
        throw new Error('Appointment was created but no appointment ID was returned');
      }

      await API.post('/payment/pay', {
        appointmentId,
        doctorId: appointmentPayload.doctorId,
        amount: Number(paymentForm.amount),
        currency: 'lkr'
      });

      await API.patch(`/appointment/${appointmentId}/status`, {
        status: 'confirmed'
      });

      toast.success('Payment successful and appointment booked!');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>Secure Payment</h2>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div style={styles.summary}>
          <p><strong>Doctor:</strong> Dr. {doctor?.name || 'Selected Doctor'}</p>
          <p><strong>Specialty:</strong> {appointmentPayload?.specialty || doctor?.specialization || doctor?.specialty || 'General'}</p>
          <p><strong>Date:</strong> {appointmentPayload?.date ? new Date(appointmentPayload.date).toLocaleDateString() : '-'}</p>
          <p><strong>Time:</strong> {appointmentPayload?.time || '-'}</p>
        </div>

        <form onSubmit={handlePay}>
          <label style={styles.label}>Card Holder Name</label>
          <input
            style={styles.input}
            type="text"
            name="cardName"
            placeholder="John Silva"
            value={paymentForm.cardName}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Card Number</label>
          <input
            style={styles.input}
            type="text"
            name="cardNumber"
            placeholder="4242 4242 4242 4242"
            value={paymentForm.cardNumber}
            onChange={handleChange}
            required
          />

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Expiry (MM/YY)</label>
              <input
                style={styles.input}
                type="text"
                name="expiry"
                placeholder="12/28"
                value={paymentForm.expiry}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>CVV</label>
              <input
                style={styles.input}
                type="password"
                name="cvv"
                placeholder="123"
                value={paymentForm.cvv}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label style={styles.label}>Amount (LKR)</label>
          <input
            style={styles.input}
            type="number"
            name="amount"
            min="1"
            value={paymentForm.amount}
            onChange={handleChange}
            required
          />

          <button style={styles.payBtn} type="submit" disabled={loading}>
            {loading ? 'Processing Payment...' : 'Pay & Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'center'
  },
  card: {
    background: 'white',
    width: '100%',
    maxWidth: '560px',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    height: 'fit-content'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px'
  },
  backBtn: {
    padding: '8px 14px',
    border: 'none',
    borderRadius: '8px',
    background: '#718096',
    color: '#fff',
    cursor: 'pointer'
  },
  summary: {
    background: '#ebf8ff',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '18px',
    color: '#2c5282'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#4a5568',
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxSizing: 'border-box',
    fontSize: '15px'
  },
  row: {
    display: 'flex',
    gap: '12px'
  },
  col: {
    flex: 1
  },
  payBtn: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    background: '#2f855a',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer'
  }
};

export default Payment;

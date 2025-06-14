import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const SubscribePage = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');

  const [plan, setPlan] = useState(null);
  const [billingType, setBillingType] = useState('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!planId) return;
    axios.get(`/api/subscriptions/plans/${planId}`)
      .then(res => setPlan(res.data))
      .catch(err => console.error(err));
  }, [planId]);

  const handlePayment = async () => {
    if (!plan) return alert('Plan not loaded');
    setLoading(true);
    try {
      const res = await axios.post('/api/subscriptions/create-checkout-session', {
        planId,
        billingType,
      });
      window.location.href = res.data.url;
    } catch (error) {
      console.error(error);
      alert('Payment failed');
    }
    setLoading(false);
  };

  if (!plan) {
    return <div className="text-center mt-20 text-gray-500">Loading plan details...</div>;
  }

  const price = billingType === 'monthly' ? plan.monthlyFee : plan.annualFee;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-xl w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Subscribe to <span className="text-blue-600">{plan.name}</span></h1>
        <p className="text-gray-600 mb-4">Choose your billing cycle and continue to secure payment.</p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Billing Type</label>
          <select
            className="w-full p-2 border rounded"
            value={billingType}
            onChange={(e) => setBillingType(e.target.value)}
          >
            <option value="monthly">Monthly - ${plan.monthlyFee}</option>
            <option value="annual">Annual - ${plan.annualFee}</option>
          </select>
        </div>

        <ul className="text-left list-disc list-inside text-gray-700 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Redirecting...' : `Pay $${price} Now`}
        </button>
      </div>
    </div>
  );
};

export default SubscribePage;
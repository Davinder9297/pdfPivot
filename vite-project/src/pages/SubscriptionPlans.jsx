import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const PlanStatus = ({ currentPlan, userDetails }) => {
  if (!currentPlan || !userDetails?.subscriptionEndDate) return null;

  const isExpired = moment(userDetails.subscriptionEndDate).isBefore(moment());
  const expiryText = isExpired ? 'expired on' : 'will expire on';
  const colorClass = isExpired ? 'text-red-600' : 'text-green-400';

  return (
    <div className={`font-semibold text-lg ${colorClass}`}>
      Your <span className="capitalize">{currentPlan?.name}</span> plan {expiryText} {moment(userDetails.subscriptionEndDate).local().format('MMMM Do YYYY, h:mm:ss A')}
    </div>
  );
};

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchPlans = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Please log in to view subscription details');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const { data: plansData } = await axios.get('/api/subscriptions/plans', config);
        if (!mounted) return;
        setPlans(plansData);

        try {
          const { data: subscriptionData } = await axios.get('/api/payments/subscription-status', config);
          if (!mounted) return;
          setCurrentPlan(subscriptionData.subscription?.planDetails);
          setUserDetails(subscriptionData.subscription?.userDetails);
        } catch (subErr) {
          console.error('Error fetching subscription:', subErr);
          if (subErr.response?.status === 401) {
            setError('Your session has expired. Please log in again.');
          }
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        if (!mounted) return;
        if (err.response?.status === 404) {
          setError('The subscription service is currently unavailable. Please try again later.');
        } else if (err.response?.status === 401) {
          setError('Please log in to view subscription details');
        } else {
          setError('Failed to load subscription plans. Please try again later.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPlans();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubscribe = (planId) => {
    navigate('/subscribe?planId=' + planId);
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please log in to cancel your subscription');
          return;
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        await axios.post('/api/subscriptions/cancel', {}, config);
        const { data } = await axios.get('/api/payments/subscription-status', config);
        setCurrentPlan(data.subscription?.planDetails);
        setUserDetails(data.subscription?.userDetails);
      } catch (err) {
        console.error('Error canceling subscription:', err);
        if (err.response?.status === 401) {
          alert('Your session has expired. Please log in again.');
        } else {
          alert('Failed to cancel subscription. Please try again.');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen ">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto ">
        <div className="text-center text-red-600">
          <p>{error}</p>
          {error.includes('log in') ? (
            <button
              onClick={() => window.location.href = '/login'}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Go to Login
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto ">
      {currentPlan && <PlanStatus currentPlan={currentPlan} userDetails={userDetails} />}

      <h1 className="text-2xl font-bold mb-8">Available Plans</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          plan?.name !== 'admin' &&
          <div key={plan._id} className="bg-[#008080] text-green-400 p-8 rounded-lg shadow-md relative min-h-[600px] flex flex-col">
            {currentPlan?._id === plan._id && (
              <div className="absolute -top-3 -right-3 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm">
                Current Plan
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold mb-2">{plan.name.replace(" Plan", "")}</h2>
              <p className="text-white mb-6">
                {plan.monthlyFee === 0 ? "Free" : `$${plan.monthlyFee}/month`}
              </p>

              {plan.services.map((service, index) => (
                <div key={index} className="flex items-start mb-3">
                  <svg className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-white">
                    {service.name} ({service.monthlyQuota === -1 ? "Unlimited" : `${service.monthlyQuota}/month`})
                  </span>
                </div>
              ))}
            </div>

            {currentPlan?._id !== plan._id && (
              <div className="mt-auto pt-6">
                <button
                  onClick={() => handleSubscribe(plan._id)}
                  className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors text-base font-medium"
                >
                  {plan.monthlyFee === 0 ? "Start Free" : "Select Plan"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {currentPlan && (
        <div className="mt-8 text-center">
          <button
            onClick={handleCancelSubscription}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;

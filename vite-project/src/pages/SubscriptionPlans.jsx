import { useState, useEffect } from 'react';
import axios from 'axios';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchPlans = async () => {
      try {
        setError(null);
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Please log in to view subscription details');
          setLoading(false);
          return;
        }

        // Set auth header
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        // Fetch plans first
        const { data: plansData } = await axios.get('/api/subscriptions/plans', config);
        if (!mounted) return;
        setPlans(plansData);

        // Then fetch subscription status
        try {
          const { data: subscriptionData } = await axios.get('/api/payments/subscription-status', config);
          if (!mounted) return;
          setCurrentPlan(subscriptionData.subscription?.plan);
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

  const handleSubscribe = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to subscribe to a plan');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.post('/api/subscriptions/subscribe', {
        planId,
        subscriptionType: 'monthly'
      }, config);
      
      if (response.data?.user?.currentPlan) {
        setCurrentPlan(response.data.user.currentPlan);
      }
      
      // Redirect to checkout or show success message
      window.location.href = `/checkout?plan=${planId}`;
    } catch (err) {
      console.error('Error subscribing to plan:', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
      } else {
        alert('Failed to subscribe to plan. Please try again.');
      }
    }
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
        setCurrentPlan(data.subscription?.plan);
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
      <h1 className="text-2xl font-bold mb-8">Available Plans</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan._id} className="bg-[#008080] text-green-400 p-8 rounded-lg shadow-md relative min-h-[600px] flex flex-col">
            {currentPlan === plan.name && (
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

            {currentPlan !== plan.name && (
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
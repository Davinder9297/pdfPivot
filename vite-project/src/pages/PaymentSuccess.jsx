import React, { useEffect, useState } from 'react';

const PaymentSuccessPage = () => {
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      window.location.href = '/dashboard';
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-xl w-full text-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
          alt="Payment Success"
          className="w-24 h-24 mx-auto mb-6"
        />
        <h2 className="text-3xl font-bold text-gray-800">Payment Successful!</h2>
        <p className="text-gray-600 mt-2">Thank you for your purchase.</p>

        <div className="mt-8 text-gray-700">
          <p>
            Redirecting to your dashboard in <span className="font-bold">{secondsLeft}</span> seconds...
          </p>
          <p className="text-sm mt-2">
            Not redirected?{' '}
            <a href="/dashboard" className="text-indigo-600 font-medium underline">
              Go to Dashboard
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

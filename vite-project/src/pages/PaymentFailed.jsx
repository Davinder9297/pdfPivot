import React from 'react';

const PaymentFailedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-xl w-full text-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/564/564619.png"
          alt="Payment Failed"
          className="w-24 h-24 mx-auto mb-6"
        />
        <h2 className="text-3xl font-bold text-red-600">Payment Failed</h2>
        <p className="text-gray-600 mt-2">
          Unfortunately, your transaction could not be completed.
        </p>

        <div className="mt-8 text-gray-700">
          <p>Please try again or contact support if the issue persists.</p>
          <a
            href="/dashboard"
            className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaMoneyBill,
  FaChevronDown,
  FaChevronUp,
  FaReceipt
} from 'react-icons/fa';
import { BsCreditCard2BackFill } from 'react-icons/bs';
import { MdOutlinePayment } from 'react-icons/md';
import { AiOutlineUser } from 'react-icons/ai';

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/payments}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setPayments(res.data.payments);
      } catch (error) {
        console.error('❌ Failed to fetch payments:', error);
        if (error.response && error.response.status === 401) {
          setAuthError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Optional UI states for loading/error
  if (loading) return <div className="text-center mt-10">Loading payments...</div>;
  if (authError) return <div className="text-center text-red-600 mt-10">Authentication error. Please log in again.</div>;

  const toggleDetails = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">💳 Payment History</h1>
        <div className="space-y-6">
          {payments.map((p, idx) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
            >
              {/* Summary */}
              <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center space-x-3">
                  <FaMoneyBill className="text-green-600 text-xl" />
                  <span className="text-lg font-semibold text-green-700">
                    ${ (p.amount / 100).toFixed(2) }
                  </span>
                </div>

                <div className="flex items-center space-x-3 mt-2 md:mt-0">
                  <FaCalendarAlt className="text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {new Date(p.billingCycle.startDate).toLocaleDateString()} -{" "}
                    {new Date(p.billingCycle.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mt-2 md:mt-0">
                  <MdOutlinePayment className="text-blue-600" />
                  <span className="text-sm font-medium capitalize text-blue-700">
                    {p.billingType} Plan
                  </span>
                </div>

                <div className="flex items-center space-x-3 mt-2 md:mt-0">
                  <AiOutlineUser className="text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    {p.planId?.name || 'N/A'}
                  </span>
                </div>

                <button
                  onClick={() => toggleDetails(idx)}
                  className="mt-4 md:mt-0 text-blue-600 hover:underline flex items-center"
                >
                  {expandedIndex === idx ? (
                    <>
                      Hide Details <FaChevronUp className="ml-1" />
                    </>
                  ) : (
                    <>
                      More Details <FaChevronDown className="ml-1" />
                    </>
                  )}
                </button>
              </div>

              {/* Expanded details */}
              {expandedIndex === idx && (
                <div className="bg-gray-50 px-6 py-4 text-sm text-gray-700 space-y-2">
                  <div className="flex items-center">
                    <BsCreditCard2BackFill className="text-gray-600 mr-2" />
                    <span className="font-medium">Card:</span>{" "}
                    {p.paymentMethod.brand?.toUpperCase()} •••• {p.paymentMethod.last4}
                  </div>

                  <div className="flex items-center">
                    <FaReceipt className="text-gray-600 mr-2" />
                    <span className="font-medium">Receipt:</span>{" "}
                    <a
                      href={p.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Receipt
                    </a>
                  </div>

                  <div className="flex items-center">
                    <AiOutlineUser className="text-gray-600 mr-2" />
                    <span className="font-medium">Billing Name:</span>{" "}
                    {p.billingDetails.name || 'N/A'}
                  </div>

                  <div className="flex items-center">
                    <MdOutlinePayment className="text-gray-600 mr-2" />
                    <span className="font-medium">Email:</span>{" "}
                    {p.billingDetails.email || 'N/A'}
                  </div>

                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-600 mr-2" />
                    <span className="font-medium">Paid On:</span>{" "}
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
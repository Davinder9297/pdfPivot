const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Payment = require('../models/Payment');

// @desc    Get subscription status
// @route   GET /api/payments/subscription-status
// @access  Private
const getSubscriptionStatus = asyncHandler(async (req, res) => {
    const user = req.user;
    
    // If no subscription exists, return null
    if (!user.currentPlan) {
        return res.json({ subscription: null });
    }

    // Get the current plan details
    const plan = await Plan.findById(user.currentPlan);
    
    res.json({
        subscription: {
            userDetails:user,
            planDetails: plan
        }
    });
});


// @desc    Cancel subscription
// @route   POST /api/payments/cancel-subscription
// @access  Private
const cancelSubscription = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user.subscription) {
        res.status(400);
        throw new Error('No active subscription found');
    }

    user.subscription.status = 'cancelled';
    await user.save();

    res.json({
        message: 'Subscription cancelled successfully',
        subscription: user.subscription
    });
});
 const getUserPayments = async (req, res) => {
  const userId = req?.user?._id;

  if (!userId) {
     res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 }).populate('planId');

    res.json({
      success: true,
      count: payments?.length,
      payments
    });
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
module.exports = {
    getSubscriptionStatus,
    cancelSubscription,
    getUserPayments
}; 
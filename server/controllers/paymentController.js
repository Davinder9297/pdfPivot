const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Plan = require('../models/Plan');

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

module.exports = {
    getSubscriptionStatus,
    cancelSubscription
}; 
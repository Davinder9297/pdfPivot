const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getSubscriptionStatus,
    cancelSubscription
} = require('../controllers/paymentController.js');

// Subscription routes
router.get('/subscription-status', auth, getSubscriptionStatus);
router.post('/cancel-subscription', auth, cancelSubscription);

module.exports = router; 
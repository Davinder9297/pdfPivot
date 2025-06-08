const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
    createPlan,
    getPlans,
    updatePlan,
    deletePlan
} = require('../controllers/subscriptionController');

// Public routes
router.get('/plans', getPlans);

// Protected admin routes
router.post('/plans', auth, admin, createPlan);
router.put('/plans/:id', auth, admin, updatePlan);
router.delete('/plans/:id', auth, admin, deletePlan);

module.exports = router;

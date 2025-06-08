const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Plan = require('../models/Plan');

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('currentPlan');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate remaining images based on the current plan
    const plan = user.currentPlan || await Plan.findOne({ name: 'Basic' });
    const remainingImages = plan ? (plan.maxImages - (user.imagesProcessed || 0)) : 0;

    res.json({
      imagesProcessed: user.imagesProcessed || 0,
      remainingImages: Math.max(remainingImages, 0),
      subscription: {
        plan: user.currentPlan || { name: 'Free' },
        type: user.subscriptionType,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Track usage
router.post('/track', auth, async (req, res) => {
  try {
    const { service, imageCount = 1 } = req.body;
    
    // Get the user from the auth middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure plan is populated
    let plan = user.currentPlan;
    if (!plan) {
      // Create Basic plan if it doesn't exist
      plan = await Plan.findOne({ name: 'Basic' });
      if (!plan) {
        plan = await Plan.create({
          name: 'Basic',
          monthlyFee: 0,
          annualFee: 0,
          services: [
            {
              name: 'convert-to-jpg',
              monthlyQuota: 100,
              annualQuota: 1000
            },
            {
              name: 'convert-from-jpg',
              monthlyQuota: 100,
              annualQuota: 1000
            },
            {
              name: 'modify-rotate',
              monthlyQuota: 50,
              annualQuota: 500
            },
            {
              name: 'optimize-upscale',
              monthlyQuota: 50,
              annualQuota: 500
            }
          ]
        });
      }
    }

    // Find the service in the plan
    const serviceConfig = plan.services?.find(s => s.name === service);
    if (!serviceConfig) {
      console.error(`Service ${service} not found in plan:`, plan);
      return res.status(400).json({ error: 'Service not available in current plan' });
    }

    // Get the quota based on subscription type
    const quota = user.subscriptionType === 'annual' ? serviceConfig.annualQuota : serviceConfig.monthlyQuota;
    
    // Check if user has enough quota for this specific service
    const serviceUsage = user.usage?.find(u => u.service === service)?.count || 0;
    if (serviceUsage + imageCount > quota) {
      return res.status(403).json({ error: 'Image quota exceeded for this service' });
    }

    // Update user using findByIdAndUpdate to preserve all fields
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: { imagesProcessed: imageCount },
        $set: {
          'usage.$[elem].count': serviceUsage + imageCount,
          'usage.$[elem].lastReset': new Date()
        }
      },
      {
        new: true,
        runValidators: true,
        arrayFilters: [{ 'elem.service': service }],
        upsert: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      imagesProcessed: updatedUser.imagesProcessed,
      remainingImages: quota - updatedUser.imagesProcessed
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
});

module.exports = router; 
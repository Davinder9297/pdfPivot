const Plan = require('../models/Plan');
const User = require('../models/User');

// Create default plans if they don't exist
const createDefaultPlans = async () => {
  try {
    const plans = await Plan.find();
    if (plans.length === 0) {
      const defaultPlans = [
        {
          name: 'Basic',
          monthlyFee: 0,
          annualFee: 0,
          maxImages: 10,
          maxFileSize: 5, // MB
          maxResolution: '1920x1080',
          services: [
            { name: 'optimize-compress', monthlyQuota: 3, annualQuota: 36 },
            { name: 'optimize-upscale', monthlyQuota: 3, annualQuota: 36 },
            { name: 'optimize-remove-background', monthlyQuota: 3, annualQuota: 36 },
            { name: 'create-meme', monthlyQuota: 3, annualQuota: 36 },
            { name: 'modify-resize', monthlyQuota: 3, annualQuota: 36 },
            { name: 'modify-crop', monthlyQuota: 3, annualQuota: 36 },
            { name: 'modify-rotate', monthlyQuota: 3, annualQuota: 36 },
            { name: 'convert-to-jpg', monthlyQuota: 3, annualQuota: 36 },
            { name: 'convert-from-jpg', monthlyQuota: 3, annualQuota: 36 },
            { name: 'convert-html-to-image', monthlyQuota: 3, annualQuota: 36 },
            { name: 'security-watermark', monthlyQuota: 3, annualQuota: 36 },
            { name: 'security-blur-face', monthlyQuota: 3, annualQuota: 36 }
          ]
        },
        {
          name: 'Developer',
          monthlyFee: 4.99,
          annualFee: 47.90,
          maxImages: 100,
          maxFileSize: 10, // MB
          maxResolution: '2560x1440',
          services: [
            { name: 'optimize-compress', monthlyQuota: 10, annualQuota: 120 },
            { name: 'optimize-upscale', monthlyQuota: 10, annualQuota: 120 },
            { name: 'optimize-remove-background', monthlyQuota: 10, annualQuota: 120 },
            { name: 'create-meme', monthlyQuota: 10, annualQuota: 120 },
            { name: 'modify-resize', monthlyQuota: 10, annualQuota: 120 },
            { name: 'modify-crop', monthlyQuota: 10, annualQuota: 120 },
            { name: 'modify-rotate', monthlyQuota: 10, annualQuota: 120 },
            { name: 'convert-to-jpg', monthlyQuota: 10, annualQuota: 120 },
            { name: 'convert-from-jpg', monthlyQuota: 10, annualQuota: 120 },
            { name: 'convert-html-to-image', monthlyQuota: 10, annualQuota: 120 },
            { name: 'security-watermark', monthlyQuota: 10, annualQuota: 120 },
            { name: 'security-blur-face', monthlyQuota: 10, annualQuota: 120 }
          ]
        },
        {
          name: 'Business',
          monthlyFee: 6.99,
          annualFee: 67.10,
          maxImages: -1, // unlimited
          maxFileSize: 20, // MB
          maxResolution: '3840x2160',
          services: [
            { name: 'optimize-compress', monthlyQuota: -1, annualQuota: -1 },
            { name: 'optimize-upscale', monthlyQuota: -1, annualQuota: -1 },
            { name: 'optimize-remove-background', monthlyQuota: -1, annualQuota: -1 },
            { name: 'create-meme', monthlyQuota: -1, annualQuota: -1 },
            { name: 'modify-resize', monthlyQuota: -1, annualQuota: -1 },
            { name: 'modify-crop', monthlyQuota: -1, annualQuota: -1 },
            { name: 'modify-rotate', monthlyQuota: -1, annualQuota: -1 },
            { name: 'convert-to-jpg', monthlyQuota: -1, annualQuota: -1 },
            { name: 'convert-from-jpg', monthlyQuota: -1, annualQuota: -1 },
            { name: 'convert-html-to-image', monthlyQuota: -1, annualQuota: -1 },
            { name: 'security-watermark', monthlyQuota: -1, annualQuota: -1 },
            { name: 'security-blur-face', monthlyQuota: -1, annualQuota: -1 }
          ]
        }
      ];

      await Plan.insertMany(defaultPlans);
      console.log('Default plans created successfully');
    }
  } catch (err) {
    console.error('Error creating default plans:', err);
  }
};

// Call the function to create default plans
createDefaultPlans();

// Admin functions
exports.createPlan = async (req, res) => {
  try {
    const { name, monthlyFee, annualFee, services } = req.body;
    
    // Validate plan name
    if (!['Basic', 'Developer', 'Business'].includes(name)) {
      return res.status(400).json({ error: 'Invalid plan name' });
    }

    // Validate services
    const validServices = [
      'optimize-compress', 'optimize-upscale', 'optimize-remove-background',
      'create-meme', 'modify-resize', 'modify-crop',
      'modify-rotate', 'convert-to-jpg', 'convert-from-jpg',
      'convert-html-to-image', 'security-watermark', 'security-blur-face'
    ];

    for (const service of services) {
      if (!validServices.includes(service.name)) {
        return res.status(400).json({ error: `Invalid service: ${service.name}` });
      }
    }

    const plan = new Plan({
      name,
      monthlyFee,
      annualFee,
      services
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create plan' });
  }
};

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const updated = await Plan.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    // Soft delete by setting isActive to false
    await Plan.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Plan deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete plan' });
  }
};

// User subscription functions
exports.subscribeToPlan = async (req, res) => {
  try {
    const { planId, subscriptionType } = req.body;
    const userId = req.user.id;

    // Validate subscription type
    if (!['monthly', 'annual'].includes(subscriptionType)) {
      return res.status(400).json({ error: 'Invalid subscription type' });
    }

    // Find the plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    if (subscriptionType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Update user's subscription using findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        currentPlan: planId,
        subscriptionType: subscriptionType,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        usage: plan.services.map(service => ({
          service: service.name,
          count: 0,
          lastReset: startDate
        }))
      },
      { new: true, runValidators: true }
    ).select('-password').populate('currentPlan');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Successfully subscribed to plan',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error subscribing to plan:', err);
    res.status(500).json({ error: 'Failed to subscribe to plan' });
  }
};

exports.checkUsage = async (req, res) => {
  try {
    const { service } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId).populate('currentPlan');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const serviceUsage = user.usage.find(u => u.service === service);
    if (!serviceUsage) {
      return res.status(404).json({ error: 'Service usage not found' });
    }

    const planService = user.currentPlan.services.find(s => s.name === service);
    if (!planService) {
      return res.status(404).json({ error: 'Service not found in plan' });
    }

    const quota = user.subscriptionType === 'annual' ? 
      planService.annualQuota : planService.monthlyQuota;

    res.json({
      used: serviceUsage.count,
      quota: quota,
      remaining: quota === -1 ? 'unlimited' : Math.max(0, quota - serviceUsage.count)
    });
  } catch (err) {
    console.error('Error checking usage:', err);
    res.status(500).json({ error: 'Failed to check usage' });
  }
};

exports.incrementUsage = async (req, res) => {
  try {
    const { service } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const serviceUsage = user.usage.find(u => u.service === service);
    if (!serviceUsage) {
      return res.status(404).json({ error: 'Service usage not found' });
    }

    serviceUsage.count += 1;
    await user.save();

    res.json({ message: 'Usage incremented successfully', count: serviceUsage.count });
  } catch (err) {
    console.error('Error incrementing usage:', err);
    res.status(500).json({ error: 'Failed to increment usage' });
  }
};

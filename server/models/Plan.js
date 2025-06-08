const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  monthlyFee: {
    type: Number,
    required: true,
    default: 0
  },
  annualFee: {
    type: Number,
    required: true,
    default: 0
  },
  features: [{
    type: String,
    required: true
  }],
  services: [{
    name: {
      type: String,
      required: true,
      enum: [
        'optimize-compress',
        'optimize-upscale',
        'optimize-remove-background',
        'create-meme',
        'modify-resize',
        'modify-crop',
        'modify-rotate',
        'convert-to-jpg',
        'convert-from-jpg',
        'convert-html-to-image',
        'security-watermark',
        'security-blur-face',
        'convert-video',
        'convert-audio'
      ]
    },
    monthlyQuota: {
      type: Number,
      required: true,
      default: 0
    },
    annualQuota: {
      type: Number,
      required: true,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);

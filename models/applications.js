const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin/Staff who reviews it
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);

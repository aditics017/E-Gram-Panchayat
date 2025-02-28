const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: [String],  
        enum: ["Agriculture", "Water", "Land", "Infrastructure", "Education", "Health", "Welfare", "Finance", "Employment", "Other"],
        required: true
    },
    fee: { type: Number, default: 0 },
    processingTime: { type: Date, default: () => new Date() },
    approvalRequired: { type: Boolean, default: true },
    location: { type: String },
    state: { type: String }
});

module.exports = mongoose.model('Service', serviceSchema);

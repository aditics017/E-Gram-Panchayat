// models/Eligibility.js
const mongoose = require('mongoose');

const eligibilitySchema = new mongoose.Schema({
    criteria: { type: String, required: true }, // Description of eligibility condition
    ageRequirement: { type: Number }, // Minimum age required
    incomeLimit: { type: Number }, // Income limit for eligibility (if applicable)
    residencyRequirement: { type: String }, // Required place of residence
    otherConditions: [{ type: String }] // Additional conditions
});

module.exports = mongoose.model('Eligibility', eligibilitySchema);

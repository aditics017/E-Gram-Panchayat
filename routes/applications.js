const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application');
const Application = require('../models/applications');
const { isLoggedIn, isAdmin } = require('./middleware');

// User Routes
router.get('/', isLoggedIn, applicationController.getAllApplications);
router.post('/services/:serviceId/apply', isLoggedIn, applicationController.submitApplication);
router.get('/status', isLoggedIn, applicationController.getApplicationStatus);

// Admin Routes
router.post('/admin/applications/:applicationId/update', isLoggedIn, isAdmin, applicationController.updateApplicationStatus);
// DELETE application by ID
router.delete('/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Deleting application with ID: ${id}`); // Debugging log

        const deletedApp = await Application.findByIdAndDelete(id);
        if (!deletedApp) {
            throw new Error("Application not found"); // Handle missing application
        }

        console.log("Application deleted successfully");
        req.flash('success', 'Application deleted successfully!');
        res.redirect('/applications');
    } catch (err) {
        console.error("Error deleting application:", err.message); // Log actual error
        req.flash('error', `Error deleting application: ${err.message}`);
        res.redirect('/applications');
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service');
const Application = require('../models/applications');
const Service =require('../models/services');
const { isLoggedIn, isAdmin } = require('./middleware');

// Routes
router.get("/", async (req, res) => {
    console.log("User:", req.user);  // Debugging user details
    const services = await Service.find({});
    res.render("services/index", { services, user: req.user });
});
router.get('/new', isLoggedIn, isAdmin, serviceController.renderNewForm);
router.post('/', isLoggedIn, isAdmin, serviceController.createService);

router.get('/:id', serviceController.getServiceById);
router.get('/:id/edit', isLoggedIn, isAdmin, serviceController.renderEditForm);
router.put('/:id', isLoggedIn, isAdmin, serviceController.updateService);
router.delete('/:id', isLoggedIn, isAdmin, serviceController.deleteService);

// Apply to a service
router.get('/:id/apply', isLoggedIn, serviceController.renderApplyForm);

// Add the application submission route here ✅
router.post('/:id/apply', isLoggedIn, async (req, res) => {
    try {
        const serviceId = req.params.id;
        const userId = req.user._id; // Ensure the user is logged in

        // Create a new application entry
        const newApplication = new Application({
            user: userId,
            service: serviceId,
            status: 'pending'
        });

        await newApplication.save();

        // Redirect to applications page
        res.redirect('/applications');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing your application.');
    }
});

// Delete an application
router.delete('/applications/:id', isLoggedIn, async (req, res) => {
    try {
        const applicationId = req.params.id;
        const userId = req.user._id;

        // Find the application
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).send('Application not found.');
        }

        // Ensure only the user who applied or an admin can delete it
        if (application.user.toString() !== userId.toString()) {
            return res.status(403).send('Unauthorized to delete this application.');
        }

        await Application.findByIdAndDelete(applicationId);

        // Redirect to applications page
        res.redirect('/applications');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting application.');
    }
});

module.exports = router;
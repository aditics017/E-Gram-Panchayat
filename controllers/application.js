const Application = require('../models/applications');
const Service = require('../models/services');

// Show all applications
module.exports.getAllApplications = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send("Unauthorized. Please log in.");
        }

        const applications = await Application.find({ user: req.user._id }) 
            .populate('user', 'name') 
            .populate('service', 'title')
            .populate('reviewedBy', 'name');

        res.render('applications/show', { applications, user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching applications.');
    }
};



// Submit a new application
module.exports.submitApplication = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).send('Service Not Found');
        }

        const newApplication = new Application({
            user: req.user._id,  // Ensure user is logged in
            service: serviceId
        });

        await newApplication.save();
        res.redirect('/applications');  // Redirecting after submission
    } catch (err) {
        console.error(err);
        res.status(500).send("Error submitting application");
    }
};


// View application status (for users)
module.exports.getApplicationStatus = async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user._id }).populate('service');
        res.render('applications/status', { applications });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving application status");
    }
};

// Admin - Update application status
module.exports.updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).send('Application Not Found');
        }

        application.status = status;
        application.reviewedBy = req.user._id; // Assuming admin is logged in
        await application.save();

        res.redirect('/admin/applications');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating application status");
    }
};


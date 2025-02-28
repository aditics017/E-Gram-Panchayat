const Service = require('../models/services');

// Get all services
module.exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find({});
        res.render('services/index', { services, user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// Show a single service
module.exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).send('Service Not Found');
        }
        res.render('services/show', { service, user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// Render new service form (Admin only)
module.exports.renderNewForm = (req, res) => {
    if (req.user && req.user.role === 'admin') {
        res.render('services/new');
    } else {
        res.status(403).send('Access Denied');
    }
};

// Create a new service (Admin only)
module.exports.createService = async (req, res) => {
    try {
        if (req.user && req.user.role === 'admin') {
            const service = new Service(req.body);
            await service.save();
            res.redirect('/services');
        } else {
            res.status(403).send('Access Denied');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating service');
    }
};

// Render edit form (Admin only)
module.exports.renderEditForm = async (req, res) => {
    try {
        if (req.user && req.user.role === 'admin') {
            const service = await Service.findById(req.params.id);
            if (!service) {
                return res.status(404).send('Service Not Found');
            }
            res.render('services/edit', { service });
        } else {
            res.status(403).send('Access Denied');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// Update a service (Admin only)
module.exports.updateService = async (req, res) => {
    try {
        if (req.user && req.user.role === 'admin') {
            await Service.findByIdAndUpdate(req.params.id, req.body);
            res.redirect(`/services/${req.params.id}`);
        } else {
            res.status(403).send('Access Denied');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating service');
    }
};

// Delete a service (Admin only)
module.exports.deleteService = async (req, res) => {
    try {
        if (req.user && req.user.role === 'admin') {
            await Service.findByIdAndDelete(req.params.id);
            res.redirect('/services');
        } else {
            res.status(403).send('Access Denied');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting service');
    }
};

module.exports.renderApplyForm = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).send('Service Not Found');
        }
        res.render('services/apply', { service, user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports.submitApplication = async (req, res) => {
    try {
        const serviceId = req.params.id;
        const userId = req.user._id;

        // Create a new application entry
        const newApplication = new Application({
            user: userId,
            service: serviceId,
            status: 'pending' // Default status
        });

        await newApplication.save();

        // Redirect to the applications page
        res.redirect('/applications');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing your application.');
    }
};
const express = require("express");
const { isAdmin } = require("./middleware");
const router = express.Router();
const Application = require("../models/applications"); // Import Application model
const User = require("../models/users"); // Import User model to fetch reviewer
const Service = require("../models/services"); // Import Service model

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin"; // Use hashed passwords in production

const VALID_CATEGORIES = [
    "Agriculture", "Water", "Land", "Infrastructure",
    "Education", "Health", "Welfare", "Finance", "Employment", "Other"
];

// Ensure Admin Session is Set Before Each Route
router.use((req, res, next) => {
    if (!req.session.user) {
        req.session.user = {
            email: ADMIN_EMAIL,
            role: "admin",
            _id: "admin" // Dummy ID for admin actions
        };
    }
    console.log("Current User:", req.session.user);
    next();
});

// Admin Login Page
router.get("/login", (req, res) => {
    res.render("admin/login", { messages: req.flash() });
});

// Handle Admin Login
router.post("/login", async (req, res) => {  // ✅ Mark function as async
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Create a fake admin user using Mongoose User model
        let adminUser = await User.findOne({ email });
        if (!adminUser) {
            adminUser = new User({ email, role: "admin" });
            await adminUser.save();
        }

        // ✅ Use Passport login to ensure `req.user` is set
        req.login(adminUser, (err) => {
            if (err) {
                console.error("Login error:", err);
                req.flash("error", "Login failed. Try again.");
                return res.redirect("/admin/login");
            }

            // ✅ Explicitly save session before redirecting
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    req.flash("error", "Session issue. Try again.");
                    return res.redirect("/admin/login");
                }
                req.flash("success", "Welcome, Admin!");
                return res.redirect("/admin/dashboard");
            });
        });
    } else {
        req.flash("error", "Invalid Admin Credentials");
        return res.redirect("/admin/login");
    }
});


// Admin Dashboard
router.get("/dashboard", (req, res) => {
    console.log("📌 Admin Dashboard - Session:", req.session);
    console.log("👤 Admin User:", req.user);
    res.render("admin/dashboard");
});


// Manage Applications Page
router.get("/manageApplications", isAdmin, async (req, res) => {
    try {
        const applications = await Application.find().populate("user service reviewedBy");
        res.render("admin/manageApplications", { applications });
    } catch (error) {
        console.error(error);
        req.flash("error", "Error loading applications.");
        res.redirect("/admin/dashboard");
    }
});

// Update Application Status
router.post("/applications/:id/update", isAdmin, async (req, res) => {
    try {
        await Application.findByIdAndUpdate(req.params.id, { status: req.body.status });
        req.flash("success", "Application status updated.");
    } catch (error) {
        req.flash("error", "Failed to update application.");
    }
    res.redirect("/admin/manageApplications");
});


// Admin View of Services
router.get("/services", isAdmin, async (req, res) => {
    try {
        const services = await Service.find();
        res.render("admin/adminServices", { services });
    } catch (err) {
        console.error("Error fetching services:", err);
        res.status(500).send("Server Error");
    }
});

// Admin Edit Service Page
router.get("/services/edit/:id", isAdmin, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            req.flash("error", "Service not found.");
            return res.redirect("/admin/services");
        }
        res.render("admin/editService", { service });
    } catch (err) {
        console.error("Error fetching service:", err);
        req.flash("error", "Server Error.");
        res.redirect("/admin/services");
    }
});

// Update Existing Service
router.post("/services/edit/:id", isAdmin, async (req, res) => {
    console.log("Received data:", req.body);

    try {
        let { title, description, category, fee, processingTime, approvalRequired, location, state } = req.body;

        // List of valid categories
        const validCategories = ["Agriculture", "Water", "Land", "Infrastructure", "Education", "Health", "Welfare", "Finance", "Employment", "Other"];

        // Ensure category is properly formatted as an array
        const selectedCategories = Array.isArray(category) ? category : category ? [category] : [];

        console.log("Selected Categories:", selectedCategories);

        // Validate categories
        if (!selectedCategories.every(cat => validCategories.includes(cat))) {
            console.log("Invalid category detected:", selectedCategories.filter(cat => !validCategories.includes(cat)));
            return res.status(400).json({ error: "Invalid category selected!" });
        }

        // Update the service in the database
        await Service.findByIdAndUpdate(req.params.id, {
            title,
            description,
            category: selectedCategories,
            fee,
            processingTime,
            approvalRequired: approvalRequired === "true",
            location,
            state
        });

        req.flash("success", "Service updated successfully!");
        res.redirect(`/admin/services`);



    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong!" });
    }
});




// New Service Page
router.get("/services/new", isAdmin, (req, res) => {
    res.render("admin/newService");
});

// Create New Service
router.post("/services/new", async (req, res) => {
    try {
        let { title, description, category, fee, processingTime, approvalRequired, location, state } = req.body;

        // Ensure category is an array
        if (typeof category === "string") {
            category = [category];
        }

        // Validate category selection
        const VALID_CATEGORIES = ["Agriculture", "Water", "Land", "Infrastructure", "Education", "Health", "Welfare", "Finance", "Employment", "Other"];
        if (!category || !Array.isArray(category) || category.some(cat => !VALID_CATEGORIES.includes(cat))) {
            return res.status(400).json({ error: "Invalid category selected!" });
        }

        // Convert approvalRequired to boolean
        approvalRequired = approvalRequired === "true";

        // Create and save new service
        const newService = new Service({
            title,
            description,
            category,
            fee: Number(fee),
            processingTime: new Date(processingTime),
            approvalRequired,
            location,
            state
        });

        await newService.save();

        // Redirect to services page after successful creation
        res.redirect("/admin/services");

    } catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});






// Delete Service
router.post("/services/delete/:id", isAdmin, async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        req.flash("success", "Service deleted successfully.");
        res.redirect("/admin/services");
    } catch (err) {
        console.error(err);
        req.flash("error", "Error deleting service.");
        res.redirect("/admin/services");
    }
});

module.exports = router;

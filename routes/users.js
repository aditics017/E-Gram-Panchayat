const express = require("express");
const router = express.Router();
const passport = require("passport");
const users = require("../controllers/user");

// Signup Routes
router.get("/signup", users.renderSignup);
router.post("/signup", users.signup);

// Login Routes
router.get("/login", users.renderLogin); // FIXED: Correct function for rendering login page
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect("/login");

        req.logIn(user, (err) => {
            if (err) return next(err);
            
            req.flash("success", "Welcome back!"); // Flash success message
            return res.redirect("/"); // Redirect after login
        });
    })(req, res, next);
});




// Logout Route
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logged out successfully!");
        res.redirect("/");
    });
});

module.exports = router;

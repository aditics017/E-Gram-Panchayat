const User = require("../models/users");

// Render Signup Page
module.exports.renderSignup = (req, res) => {
    res.render("users/signup");
};

// Handle User Signup
module.exports.signup = async (req, res) => {
    try {
        const { name, email, mobile, password, role } = req.body;
        const user = new User({ name, email, mobile, role });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to E-Gram Panchayat!");
            res.redirect("/");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

// Render Login Page
module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

// Handle User Login
module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

// Handle Logout
module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logged out successfully!");
        res.redirect("/");
    });
};

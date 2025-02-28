module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }
    next();
};

module.exports.isAdmin =(req, res, next)  => {
    if (req.session.user && req.session.user.role === "admin") {
        return next(); // Admin user, proceed to the next middleware
    } else {
        req.flash("error", "You are not authorized to access this page.");
        res.redirect("/admin/login");
    }
}

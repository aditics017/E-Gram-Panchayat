const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const methodOverride = require('method-override');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const adminRoutes = require("./routes/admin"); 
const applicationRoutes = require('./routes/applications');
const ExpressError = require('./utils/ExpressError');
const wrapAsync = require('./utils/wrapAsync');
const User = require('./models/users');
const engine = require('ejs-mate');


dotenv.config();
const app = express();

mongoose.connect(process.env.MONGO_URI) // No need for extra options
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const store = MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600
});

store.on("error", (err) => { 
    console.log("ERROR in MONGO SESSION STORE", err); 
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.engine('ejs', engine)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(session(sessionOptions));

app.use(flash());

app.use((req, res, next) => {
    res.locals.currentPath = req.path;  // Making currentPath available in all EJS templates
    next();
  });

app.use(passport.initialize()); 
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => { 
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error"); 
  res.locals.currUser = req.user; 
  console.log("Current User:", req.user);
  next(); 
});
// Pass flash messages to all templates
app.use((req, res, next) => {
    res.locals.messages = req.flash(); // Makes `messages` available globally in views
    next();
});

app.use("/admin", adminRoutes); // Use admin routes
app.use("/", userRoutes);
app.use('/services', serviceRoutes);
app.use('/applications', applicationRoutes);

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});


app.get("/", (req, res) => {
    console.log("🏠 Home route accessed!");
    res.render("index");
});

app.all("*", (req, res, next) => {
    next(new ExpressError(404, `Page Not Found!: ${req.originalUrl}`));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

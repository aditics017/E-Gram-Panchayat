const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    mobile: { type: String, unique: true, required: true },
    role: { type: String, enum: ['citizen', 'staff', 'admin'], default: 'citizen' }
});

// Passport-Local Mongoose handles password hashing
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model('User', userSchema);

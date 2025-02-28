const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/users");
const Service = require("./models/services");
const Eligibility = require("./models/eligibility");
const Application = require("./models/applications");

dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected");
}).catch(err => console.log(err));

const seedDatabase = async () => {
    try {
        console.log("Seeding Data...");

        // Clear existing data
        await User.deleteMany();
        await Service.deleteMany();
        await Eligibility.deleteMany();
        await Application.deleteMany();

        // Seed Users
        const users = await User.insertMany([
            { name: "Aditi Kulkarni", email: "aditi@example.com", mobile: "9876543210", role: "citizen" },
            { name: "Admin User", email: "admin@example.com", mobile: "1234567890", role: "admin" },
            { name: "Staff User", email: "staff@example.com", mobile: "1122334455", role: "staff" }
        ]);

        // Seed Eligibility
        const eligibility = await Eligibility.create({
            criteria: "Must be a resident for 3 years",
            ageRequirement: 18,
            incomeLimit: 400000,
            residencyRequirement: "State Resident",
            otherConditions: ["Valid Aadhar card", "No pending legal cases"]
        });

        // Seed Services
        const services = await Service.insertMany([
            {
                title: "Farmer Support Scheme",
                description: "Financial aid for small-scale farmers",
                category: ["Agriculture"],
                eligibility: eligibility._id,
                fee: 200,
                location: "Village Panchayat",
                state: "Karnataka",
                owner: users[1]._id,
                geometry: { type: "Point", coordinates: [77.5946, 12.9716] }
            },
            {
                title: "Scholarship Program",
                description: "Educational scholarship for students",
                category: ["Education"],
                eligibility: eligibility._id,
                fee: 0,
                location: "City Corporation",
                state: "Maharashtra",
                owner: users[2]._id,
                geometry: { type: "Point", coordinates: [72.8777, 19.0760] }
            }
        ]);

        // Seed Applications
        await Application.create({
            user: users[0]._id,
            service: services[0]._id,
            status: "pending",
            reviewedBy: users[1]._id
        });

        console.log("✅ Seeding Complete!");
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Error Seeding Data:", err);
        mongoose.connection.close();
    }
};

// Run Seeder
seedDatabase();

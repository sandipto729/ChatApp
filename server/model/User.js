const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    profilePic: { type: String },
    status: { type: String, default: "Hey there! I am using ChatApp" },
    refreshToken: { type: String } 
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    admin: {type: Boolean, default: false},
    registerDate: {type: Date, default: Date.now},
    money: {type: Number, default: "50"},
    tickMultiplier: {type: Number, default: "1"},
    afkMax: {type: Number, default: "100"},
    level: {type: Number, default: "1"},
    tickMultiplierShopLevel: {type: Number, default: "1"},
    afkMaxShopLevel: {type: Number, default: "1"},
    inventory: [],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
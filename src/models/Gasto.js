const mongoose = require("mongoose");

const gastoSchema = new mongoose.Schema({
    amount: Number,
    category: String,
    date: { type: Date, default: Date.now },
    currency: { type: String, default: "$" },
    user: Object,
});

module.exports = mongoose.model("Gasto", gastoSchema);
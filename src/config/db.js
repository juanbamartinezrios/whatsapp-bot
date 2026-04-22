const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ MongoDB conectado");
    } catch (err) {
        console.error("❌ MongoDB error:", err);
    }
};

module.exports = connectDB;
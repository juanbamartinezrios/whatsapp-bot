require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const whatsappRoutes = require("./src/routes/whatsapp.routes");
const connectDB = require("./src/config/db");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", whatsappRoutes);

connectDB();

app.listen(3000, () => {
    console.log("🚀 Server corriendo en puerto 3000");
});
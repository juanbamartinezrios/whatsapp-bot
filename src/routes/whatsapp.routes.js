const express = require("express");
const { handleWhatsappMessage } = require("../controllers/whatsapp.controller");

const router = express.Router();

router.post("/", handleWhatsappMessage);

module.exports = router;
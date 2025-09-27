const express = require("express");
const router = express.Router();
const { createPayment, notifyPayment } = require("../../controllers/payement.controllers");

router.post("/payment/create", createPayment);
router.post("/payment/notify", notifyPayment);

module.exports = router;
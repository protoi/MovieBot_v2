const express = require("express");
const onboarding_router = express.Router();
const onboarding_controllers = require("../Controllers/onboarding.controllers")

onboarding_router.get("/onboarding/get_onboarding_qrcode", onboarding_controllers.get_onboarding_qrcode)

module.exports = {onboarding_router}
const express = require("express");
const frequency_router = express.Router();

const frequency_controllers = require("../Controllers/frequency.controllers");

frequency_router.get("/frequency", frequency_controllers.dosomething);

module.exports = { frequency_router };

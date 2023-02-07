const express = require("express");
const default_router = express.Router();
const default_controllers = require("../Controllers/default.controllers");
default_router.get("/", default_controllers.ping);

module.exports = { default_router };

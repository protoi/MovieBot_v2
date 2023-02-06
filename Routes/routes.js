const express = require("express");
const router = express.Router();
const user_controls = require("../Controllers/controllers");

router.get("/", user_controls.ping);
router.get("/movie", user_controls.verify_token);
router.post("/movie", user_controls.fetch_info_and_post_to_whatsapp);

module.exports = router;

const express = require("express");
const router = express.Router();
const user_controls = require("../Controllers/controllers");
const mw = require("../Middleware/middleware");
router.get("/", user_controls.ping);
router.get("/movie", user_controls.verify_token);

router.post(
  "/movie",
  mw.validate_dependencies,
  user_controls.fetch_info_and_post_to_whatsapp
);

// router.post("/movie", user_controls.fetch_info_and_post_to_whatsapp);

module.exports = router;

const express = require("express");
const movie_router = express.Router();

const movie_controllers = require("../Controllers/movie.controllers");
const movie_middleware = require("../Middleware/movie.middlewares");

movie_router.get("/movie", movie_controllers.verify_token);

movie_router.post(
  "/movie",
  movie_middleware.validate_dependencies,
  movie_controllers.fetch_info_and_post_to_whatsapp
);

module.exports = { movie_router };

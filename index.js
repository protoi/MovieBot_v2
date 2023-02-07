const { default_router } = require("./Routes/default.routes");
const { movie_router } = require("./Routes/movie.routes");
const { frequency_router } = require("./Routes/frequency.routes");

const express = require("express");

const PORT = 9999;
const exp = express();
exp.use(express.json());
exp.use(express.urlencoded({ extended: true }));

exp.use("/", default_router);
exp.use("/", movie_router);
exp.use("/", frequency_router);

exp.listen(PORT, () => {
  console.log(`express app listening to port #${PORT}`);
  console.log("hello world");
});

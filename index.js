const { default_router } = require("./Routes/default.routes");
const { movie_router } = require("./Routes/movie.routes");
const cors = require("cors");

const { onboarding_router } = require("./Routes/onboarding.routes");
const { frequency_router } = require("./Routes/frequency.routes");
var bodyparser = require("body-parser");
const mongoose = require("mongoose");

const express = require("express");
const { query_router } = require("./Routes/query.routes");

const PORT = 9999;
const exp = express();
exp.use(express.json());
exp.use(
  express.urlencoded({
    extended: true,
  })
);
exp.use(bodyparser.json());

mongoose.set("strictQuery", false);

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_CLUSTER_INFORMATION}.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`
);

/* const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
}); */

exp.use(cors());

exp.use("/", default_router);
exp.use("/", movie_router);
exp.use("/", frequency_router);
exp.use("/", query_router);
exp.use("/", onboarding_router);

exp.listen(PORT, () => {
  console.log(`express app listening to port #${PORT}`);
  console.log("hello world");
});

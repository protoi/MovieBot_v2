const { default_router } = require("./Routes/default.routes");
const { movie_router } = require("./Routes/movie.routes");
const { frequency_router } = require("./Routes/frequency.routes");
const mongoose = require("mongoose");

const express = require("express");
const { query_router } = require("./Routes/query.routes");

const PORT = 9999;
const exp = express();
exp.use(express.json());
exp.use(express.urlencoded({ extended: true }));

mongoose.set("strictQuery", false);
mongoose.connect(
  "mongodb+srv://niladri:KtJaWVe6TrvhbHZE@cluster0.01lnzaz.mongodb.net/?retryWrites=true&w=majority",
  {
    /*useNewUrlParser: true,
    //useFindAndModify: false,
    useUnifiedTopology: true,*/
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});


exp.use("/", default_router);
exp.use("/", movie_router);
exp.use("/", frequency_router);
exp.use("/", query_router);

exp.listen(PORT, () => {
  console.log(`express app listening to port #${PORT}`);
  console.log("hello world");
});

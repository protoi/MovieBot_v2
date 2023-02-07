const router = require("./Routes/routes");
const express = require("express");


const PORT = 9999;
const exp = express();
exp.use(express.json());
exp.use(express.urlencoded({ extended: true }));

exp.use("/", router);
exp.listen(PORT, () => {
  console.log(`express app listening to port #${PORT}`);
  console.log("hello world");
});

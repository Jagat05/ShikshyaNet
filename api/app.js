const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

// Importing Routes
const userRoute = require("./routes/user");
const studentRoute = require("./routes/student");
const feeRoute = require("./routes/fee");
const courseRoute = require("./routes/course");

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://ShikshyaNet:ShikshyaNetMongo@sikshyanet.cxbbdsh.mongodb.net/?retryWrites=true&w=majority&appName=SikshyaNet"
  )
  .then(() => {
    console.log("Successfully Connected With Database");
  })
  .catch((err) => {
    console.log("Database Connection Error:", err.message);
  });

app.use(bodyParser.json());
// Middleware to parse JSON
// app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Route Definitions
app.use("/user", userRoute); // → /user/signup
app.use("/student", studentRoute); // → /student/add-student
app.use("/course", courseRoute); // → /batch/add-batch
app.use("/fee", feeRoute); // → /fee/add-fee

// Handle 404 Errors
app.use("*", (req, res) => {
  res.status(404).json({ msg: "Bad Request" });
});

module.exports = app;

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

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

// Enable CORS for your frontend origin
app.use(
  cors({
    origin: "http://localhost:8080", // <-- change this if your frontend runs on a different port or domain
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Importing Routes
const userRoute = require("./routes/user");
const studentRoute = require("./routes/student");
const feeRoute = require("./routes/fee");
const courseRoute = require("./routes/course");

// Route Definitions
app.use("/user", userRoute); // → /user/signup
app.use("/student", studentRoute); // → /student/add-student
app.use("/course", courseRoute); // → /course/add-course
app.use("/fee", feeRoute); // → /fee/add-fee

// Handle 404 Errors
app.use("*", (req, res) => {
  res.status(404).json({ msg: "Bad Request" });
});

module.exports = app;

const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const User = require("../model/User");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Load environment variables
require("dotenv").config();

// Log values to verify they are loaded
// console.log(process.env.CLOUD_NAME);
// console.log(process.env.API_KEY);
// console.log(process.env.API_SECRET);

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Signup Route
router.post("/signup", (req, res) => {
  User.find({ email: req.body.email }).then((users) => {
    if (users.length > 0) {
      return res.status(500).json({
        error: "Email already Registered !!",
      });
    }
    //console.log("Request Body: ", req.body);
    //console.log("Request Files: ", req.files);

    // Validate input fields
    if (
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.email ||
      !req.body.password
    ) {
      return res.status(400).json({ msg: "All fields are required!" });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ msg: "Image is required!" });
    }

    // Upload to Cloudinary
    cloudinary.uploader.upload(req.files.image.tempFilePath, (err, result) => {
      // console.log(result);
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err,
          });
        }
        const newUser = new User({
          _id: new mongoose.Types.ObjectId(),
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: hash,
          imageUrl: result.secure_url,
          imageId: result.public_id,
        });
        newUser
          .save()
          .then((result) => {
            res.status(200).json({
              newStudent: result,
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      });

      // if(!err){
      //   console.log("Problem in Uplaod"+err);
      // }else{
      //   console.log(reasult);
      // }
    });
    // console.log(req.body);
    // console.log(req.files);
    // res.status(200).json({
    //   msg: "Signup Request !"
    // });
  });
});
//login
router.post("/login", (req, res) => {
  User.find({ email: req.body.email }).then((users) => {
    if (users.length === 0) {
      return res.status(404).json({
        msg: "User Not Found !",
      });
    }
    bcrypt.compare(req.body.password, users[0].password, (err, reasult) => {
      if (!reasult) {
        return res.status(500).json({
          error: "Incorrect Password",
        });
      }
      const token = jwt.sign(
        {
          email: users[0].email,
          firstName: users[0].firstName,
          lastName: users[0].lastName,
          uid: users[0]._id,
        },
        "SikshyanNet98765",
        {
          expiresIn: "365d",
        }
      );

      console.log("Login Successful");
      res.status(200).json({
        _id: users[0]._id,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        email: users[0].email,
        imageUrl: users[0].imageUrl,
        imageId: users[0].imageId,
        token: token,
      });
    });
  });
});

module.exports = router;

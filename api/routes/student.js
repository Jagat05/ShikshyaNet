const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/checkAuth");
const Student = require("../model/Student");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Add New Student
router.post("/add-student", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  if (!req.files || !req.files.image) {
    return res.status(400).json({ error: "Image file is required." });
  }

  cloudinary.uploader.upload(req.files.image.tempFilePath, (err, result) => {
    if (err) {
      console.error("Cloudinary upload error:", err);
      return res.status(500).json({ error: "Image upload failed." });
    }

    const newStudent = new Student({
      fullname: req.body.fullname,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      courseId: req.body.courseId,
      uid: verify.uid, // FIXED: use decoded token uid
      imageUrl: result.secure_url,
      imageId: result.public_id,
    });

    newStudent
      .save()
      .then((savedStudent) => {
        return res.status(200).json({ newStudent: savedStudent });
      })
      .catch((saveErr) => {
        console.error("Database save error:", saveErr);
        return res.status(500).json({ error: saveErr });
      });
  });
});
router.post("/add-student", (req, res) => {
  res.status(200).json({
    msg: "Add New Student Request !",
  });
});
//get all students
router.get("/all-students", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  Student.find({ uid: verify.uid })
    .select(
      "_id fullname phone email address courseId imageUrl imageId createdAt updatedAt"
    )
    .then((students) => {
      return res.status(200).json({ students });
    })
    .catch((err) => {
      console.error("Database query error:", err);
      return res.status(500).json({ error: err });
    });
});
// Get one Student
router.get("/student/:id", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  Student.findOne({ _id: req.params.id, uid: verify.uid })
    .then((student) => {
      if (!student) {
        return res.status(404).json({ error: "Student not found." });
      }
      return res.status(200).json({ student });
    })
    .catch((err) => {
      console.error("Database query error:", err);
      return res.status(500).json({ error: err });
    });
});
// Update Student with Image
router.put("/update-student/:id", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  if (!req.files || !req.files.image) {
    return res.status(400).json({ error: "Image file is required." });
  }

  cloudinary.uploader.upload(req.files.image.tempFilePath, (err, result) => {
    if (err) {
      console.error("Cloudinary upload error:", err);
      return res.status(500).json({ error: "Image upload failed." });
    }

    Student.findOneAndUpdate(
      { _id: req.params.id, uid: verify.uid },
      {
        fullname: req.body.fullname,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        courseId: req.body.courseId,
        imageUrl: result.secure_url,
        imageId: result.public_id,
      },
      { new: true }
    )
      .then((updatedStudent) => {
        if (!updatedStudent) {
          return res.status(404).json({ error: "Student not found." });
        }
        return res.status(200).json({ updatedStudent });
      })
      .catch((updateErr) => {
        console.error("Database update error:", updateErr);
        return res.status(500).json({ error: updateErr });
      });
  });
});
//delete student
router.delete("/delete-student/:id", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  Student.findOneAndDelete({ _id: req.params.id, uid: verify.uid })
    .then((deletedStudent) => {
      if (!deletedStudent) {
        return res.status(404).json({ error: "Student not found." });
      }
      return res.status(200).json({ message: "Student deleted successfully." });
    })
    .catch((err) => {
      console.error("Database delete error:", err);
      return res.status(500).json({ error: err });
    });
});
//get latest 5 Stuents
router.get("/latest-students", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  Student.find({ uid: verify.uid })
    .sort({ createdAt: -1 })
    .limit(5)
    .then((students) => {
      return res.status(200).json({ students });
    })
    .catch((err) => {
      console.error("Database query error:", err);
      return res.status(500).json({ error: err });
    });
});
// get latest courses
router.get("/latest-courses", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  Student.find({ uid: verify.uid })
    .sort({ createdAt: -1 })
    .limit(5)
    .then((students) => {
      return res.status(200).json({ students });
    })
    .catch((err) => {
      console.error("Database query error:", err);
      return res.status(500).json({ error: err });
    });
});

module.exports = router;

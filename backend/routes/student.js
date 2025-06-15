// routes/student.js
const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/checkAuth");
const Student = require("../model/Student");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

// Cloudinary config - make sure env variables are set properly
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Decode JWT and get uid
const getUID = (token) => jwt.verify(token, "SikshyanNet98765").uid;

// --- Add new student ---
router.post("/students", checkAuth, async (req, res) => {
  try {
    const uid = getUID(req.headers.authorization.split(" ")[1]);
    const image = req.files?.image;
    if (!image)
      return res.status(400).json({ error: "Image file is required." });

    const result = await cloudinary.uploader.upload(image.tempFilePath);

    const newStudent = new Student({
      fullname: req.body.fullname,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      courseId: req.body.courseId,
      uid,
      imageUrl: result.secure_url,
      imageId: result.public_id,
    });

    const saved = await newStudent.save();
    res.status(201).json({ student: saved });
  } catch (err) {
    console.error("Add Student Error:", err);
    res.status(500).json({ error: "Failed to add student." });
  }
});

// --- Get all students ---
router.get("/students", checkAuth, async (req, res) => {
  try {
    const uid = getUID(req.headers.authorization.split(" ")[1]);
    const students = await Student.find({ uid }).select(
      "_id fullname phone email address courseId imageUrl createdAt updatedAt"
    );
    res.status(200).json({ students }); // returns { students: [ ... ] }
  } catch (err) {
    console.error("Fetch All Students Error:", err);
    res.status(500).json({ error: "Failed to fetch students." });
  }
});

// --- Get single student ---
router.get("/students/:id", checkAuth, async (req, res) => {
  try {
    const uid = getUID(req.headers.authorization.split(" ")[1]);
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid student ID." });

    const student = await Student.findOne({ _id: req.params.id, uid });
    if (!student) return res.status(404).json({ error: "Student not found." });
    res.status(200).json({ student });
  } catch (err) {
    console.error("Fetch Student Error:", err);
    res.status(500).json({ error: "Failed to fetch student." });
  }
});

// --- Update student ---
router.put("/students/:id", checkAuth, async (req, res) => {
  try {
    const uid = getUID(req.headers.authorization.split(" ")[1]);
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid student ID." });

    let updateData = {
      fullname: req.body.fullname,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      courseId: req.body.courseId,
    };

    if (req.files?.image) {
      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath
      );
      updateData.imageUrl = result.secure_url;
      updateData.imageId = result.public_id;
    }

    const updated = await Student.findOneAndUpdate(
      { _id: req.params.id, uid },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Student not found." });

    res.status(200).json({ student: updated });
  } catch (err) {
    console.error("Update Student Error:", err);
    res.status(500).json({ error: "Failed to update student." });
  }
});

// --- Delete student ---
router.delete("/students/:id", checkAuth, async (req, res) => {
  try {
    const uid = getUID(req.headers.authorization.split(" ")[1]);
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid student ID." });

    const deleted = await Student.findOneAndDelete({ _id: req.params.id, uid });

    if (!deleted) return res.status(404).json({ error: "Student not found." });

    res.status(200).json({ message: "Student deleted successfully." });
  } catch (err) {
    console.error("Delete Student Error:", err);
    res.status(500).json({ error: "Failed to delete student." });
  }
});

// --- Get students by course ---
router.get("/students/course/:courseId", checkAuth, async (req, res) => {
  try {
    const uid = getUID(req.headers.authorization.split(" ")[1]);
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Invalid course ID." });
    }

    const students = await Student.find({ courseId, uid }).select(
      "_id fullname phone email address courseId imageUrl createdAt updatedAt"
    );

    if (!students.length) {
      return res
        .status(404)
        .json({ error: "No students found for this course." });
    }

    res.status(200).json({ students });
  } catch (err) {
    console.error("Fetch Students by Course Error:", err);
    res.status(500).json({ error: "Failed to fetch students." });
  }
});

// --- Get latest 5 students ---
router.get("/students/latest", checkAuth, async (req, res) => {
  try {
    const uid = getUID(req.headers.authorization.split(" ")[1]);
    const students = await Student.find({ uid })
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json({ students });
  } catch (err) {
    console.error("Latest Students Error:", err);
    res.status(500).json({ error: "Failed to fetch latest students." });
  }
});

module.exports = router;

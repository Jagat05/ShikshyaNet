const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/checkAuth");
const mongoose = require("mongoose");
const Course = require("../model/Course");
const jwt = require("jsonwebtoken");
const Student = require("../model/Student");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Add New Course
router.post("/add-course", checkAuth, (req, res) => {
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

    const newCourse = new Course({
      courseName: req.body.courseName,
      price: req.body.price,
      description: req.body.description,
      startingDate: req.body.startingDate,
      endDate: req.body.endDate,
      uid: verify.uid, // FIXED: use decoded token uid
      imageUrl: result.secure_url,
      imageId: result.public_id,
    });

    newCourse
      .save()
      .then((savedCourse) => {
        return res.status(200).json({ newCourse: savedCourse });
      })
      .catch((saveErr) => {
        console.error("Database save error:", saveErr);
        return res.status(500).json({ error: saveErr });
      });
  });
});

// Get All Courses for any user
router.get("/all-courses", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  Course.find({ uid: verify.uid })
    .select(
      "_id uid courseName price description startingDate endDate imageUrl imageId"
    )
    .then((result) => {
      return res.status(200).json({ courses: result });
    })
    .catch((err) => {
      console.error("Error fetching courses:", err);
      return res.status(500).json({ error: err });
    });
});

// Get one Course for any user
// Get one Course for any user
router.get("/course-detail/:id", checkAuth, (req, res) => {
  Course.findById(req.params.id)
    .select(
      "_id uid courseName price description startingDate endDate imageUrl imageId"
    )
    .then((course) => {
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      Student.find({ courseId: req.params.id })
        .then((students) => {
          return res.status(200).json({
            course: course,
            studentList: students,
          });
        })
        .catch((err) => {
          console.error("Error fetching students:", err);
          return res.status(500).json({ error: "Error fetching students" });
        });
    })
    .catch((err) => {
      console.error("Error fetching course:", err);
      return res.status(500).json({ error: "Error fetching course" });
    });
});

// Delete course
router.delete("/:id", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  Course.findById(req.params.id).then((course) => {
    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    if (course.uid == verify.uid) {
      Course.findByIdAndDelete(req.params.id)
        .then((result) => {
          cloudinary.uploader.destroy(course.imageId, (error, deletedImage) => {
            if (error) {
              console.error("Cloudinary delete error:", error);
            }
            return res.status(200).json({ result: result });
          });
        })
        .catch((err) => {
          console.error("Error deleting course:", err);
          return res.status(500).json({ msg: err });
        });
    } else {
      return res.status(403).json({ msg: "Unauthorized" });
    }
  });
});

// Update Course
router.put("/:id", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");
  console.log("Decoded UID:", verify.uid);

  Course.findById(req.params.id)
    .then((course) => {
      if (!course) {
        console.log("Course not found");
        return res.status(404).json({ message: "Course not found" });
      }
      if (verify.uid != course.uid) {
        return res.status(500).json({
          error: "You are not eligible to update this Data",
        });
      }
      if (req.files && req.files.image) {
        console.log("Image received in update.");

        cloudinary.uploader.destroy(course.imageId, (error, deletedImage) => {
          if (error) {
            console.error("Cloudinary delete error:", error);
          } else {
            console.log("Old image deleted:", deletedImage);
          }

          cloudinary.uploader.upload(
            req.files.image.tempFilePath,
            (err, result) => {
              if (err) {
                console.error("Cloudinary upload error:", err);
                return res.status(500).json({ error: "Image upload failed." });
              }
              console.log("New image uploaded:", result);

              const newupdatedData = {
                courseName: req.body.courseName,
                price: req.body.price,
                description: req.body.description,
                startingDate: req.body.startingDate,
                endDate: req.body.endDate,
                uid: verify.uid,
                imageUrl: result.secure_url,
                imageId: result.public_id,
              };
              Course.findByIdAndUpdate(req.params.id, newupdatedData, {
                new: true,
              })
                .then((updatedCourse) => {
                  return res.status(200).json({ updatedCourse: updatedCourse });
                })
                .catch((err) => {
                  console.error("Error updating course:", err);
                  return res
                    .status(500)
                    .json({ error: "Error updating course." });
                });
            }
          );
        });
      } else {
        const updatedData = {
          courseName: req.body.courseName,
          price: req.body.price,
          description: req.body.description,
          startingDate: req.body.startingDate,
          endDate: req.body.endDate,
          uid: verify.uid,
          imageUrl: course.imageUrl,
          imageId: course.imageId,
        };
        Course.findByIdAndUpdate(req.params.id, updatedData, { new: true })
          .then((updatedCourse) => {
            return res.status(200).json({ updatedCourse });
          })
          .catch((err) => {
            console.error("Error updating course:", err);
            return res.status(500).json({ error: "Error updating course." });
          });
      }
      // console.log("Found course:", course);
    })
    .catch((err) => {
      console.error("Error finding course:", err);
      return res.status(500).json({ error: "Error finding course." });
    });
});
// get latest 5 courses
router.get("/latest-courses", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  Course.find({ uid: verify.uid })
    .sort({ createdAt: -1 })
    .limit(5)
    .then((result) => {
      return res.status(200).json({ courses: result });
    })
    .catch((err) => {
      console.error("Error fetching latest courses:", err);
      return res.status(500).json({ error: err });
    });
});

module.exports = router;

const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Fee = require("../model/fee");
const mongoose = require("mongoose");

router.post("/add-fee", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  const newFee = new Fee({
    _id: new mongoose.Types.ObjectId(),
    fullname: req.body.fullname,
    phone: req.body.phone,
    courseId: req.body.courseId,
    uid: verify.uid, // FIXED: use decoded token uid
    amount: req.body.amount,
    remarks: req.body.remarks,
    // dueDate: req.body.dueDate, // Uncomment if you want to use dueDate
    // status: req.body.status, // Uncomment if you want to use status
  });
  newFee
    .save()
    .then((savedFee) => {
      return res.status(200).json({ newFee: savedFee });
    })
    .catch((saveErr) => {
      console.error("Database save error:", saveErr);
      return res.status(500).json({ error: saveErr });
    });
});

//get all fee collection data for any user
router.get("/payment-history", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  Fee.find({ uid: verify.uid })
    .select("_id fullname phone courseId amount remarks createdAt")
    .then((fees) => {
      return res.status(200).json({ fees: fees });
    })
    .catch((err) => {
      console.error("Database query error:", err);
      return res.status(500).json({ error: err });
    });
});

// Get all payment history for a specific course and phone number
router.get("/all-payment", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "SikshyanNet98765");

  const { courseId, phone } = req.query;

  // Chain the promise correctly
  Fee.find({
    uid: verify.uid,
    courseId: courseId,
    phone: phone,
  })
    // .select("_id fullname phone courseId amount remarks createdAt")
    .then((result) => {
      return res.status(200).json({ fees: result });
    })
    .catch((err) => {
      console.error("Database query error:", err);
      return res.status(500).json({ error: err });
    });
});

module.exports = router;

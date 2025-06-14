const mongoose = require("mongoose");

const FeeSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    fullname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    uid: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    remarks: {
      type: String,
      required: true,
    },
    // dueDate: {
    //   type: Date,
    //   required: true
    // },
    // status: {
    //   type: String,
    //   enum: ['paid', 'unpaid'],
    //   default: 'unpaid'
    // },
    // uid: {
    //   type: String,
    //   required: true
    // }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fee", FeeSchema);

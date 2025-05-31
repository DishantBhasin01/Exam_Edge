const mongoose = require("mongoose");

const ExamSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    startTime: { type: Date, required: true },
    submitted: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("ExamSession", ExamSessionSchema);

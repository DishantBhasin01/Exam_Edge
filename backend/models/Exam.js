
const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    questions: [
        {
            questionText: { type: String, required: true },
            options: { type: [String], required: true },
            correctAnswer: { type: String, required: true },
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model("Exam", ExamSchema);
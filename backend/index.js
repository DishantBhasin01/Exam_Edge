
//new 

const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors"); // ✅ Added CORS
const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const autoSubmitExams = require("./utils/autoSubmit");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const uploadToS3 = require('./utils/uploadToS3');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // Change "*" to your frontend URL for security
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ✅ Middleware to parse JSON
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);



app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ✅ Auto-submit exams every minute
setInterval(autoSubmitExams, 60 * 1000);

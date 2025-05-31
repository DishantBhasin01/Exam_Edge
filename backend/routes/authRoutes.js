const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();
router.get("/admin-only", auth, authorize("admin"), (req, res) => {
    res.json({ msg: "Welcome Admin" });
});
// REGISTER USER
router.post("/signup", [
    body("name", "Name is required").notEmpty(),
    body("email", "Valid email is required").isEmail(),
    body("password", "Password must be 6+ characters").isLength({ min: 6 }),
    body("role", "Role must be admin, examiner, or student").isIn(["admin", "examiner", "student"])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(201).json({ msg: "User registered successfully", token });
    } catch (error) {
        res.status(500).json({ msg: "Server error" });
    }
});


// LOGIN USER
router.post("/login", [
    body("email", "Valid email is required").isEmail(),
    body("password", "Password is required").exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({
            msg: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role  
            }
        });
    } catch (error) {
        res.status(500).json({ msg: "Server error" });
    }
});


module.exports = router;

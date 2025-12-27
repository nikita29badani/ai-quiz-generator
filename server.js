require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Models Import
const User = require('./models/User');
const QuizLog = require('./models/QuizLog');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ DB Error:", err));

// --- GEMINI SETUP ---
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// Note: Using the model version we confirmed works for you
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" } 
});

// --- SECURITY GUARD (Middleware) ---
// Ye function check karega ki token valid hai ya nahi
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) return res.status(401).json({ error: "Access Denied. Please login!" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid Token. Please login again." });
        req.user = user; // User ka data request mein chipka diya
        next();
    });
}

// --- ROUTES ---

// 1. REGISTER
app.post('/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Password encrypt karo (Security)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await User.create({ username, email, password: hashedPassword });
        res.json({ message: "User registered successfully! Please login." });
    } catch (err) {
        res.status(400).json({ error: "Error: Email might already exist." });
    }
});

// 2. LOGIN
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Wrong Password" });

        // Token banao (ID Card)
        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET);
        res.json({ token, username: user.username });

    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// 3. GENERATE QUIZ (Protected Route 🔒)
app.post('/generate-quiz', authenticateToken, async (req, res) => {
    try {
        const { topic } = req.body;
        
        // AI ko instruction
        const prompt = `Generate 10 multiple choice questions on the topic: "${topic}". 
        Output a JSON array with objects containing: id, question, options (array of 4 strings), answer (string matching one option).`;

        const result = await model.generateContent(prompt);
        const quizData = JSON.parse(result.response.text());

        // LOGGING: Database mein save karo ki kis user ne banaya
        await QuizLog.create({
            topic: topic,
            questions: quizData,
            userId: req.user.userId,
            username: req.user.username
        });

        res.json({ quiz: quizData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "AI Error: Failed to generate quiz." });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running at: http://localhost:${port}`);
});
# 🎓 AI Quiz Pro

**AI Quiz Pro** is an intelligent, full-stack quiz application that generates unique multiple-choice questions on *any* topic instantly using **Google's Gemini AI**. It features secure user authentication, real-time scoring, and a responsive design.

🔗 *https://ai-quiz-generator-5qvv.onrender.com/* *(Click to view the live application)*

---

## 🚀 Features

- * AI-Powered:* Generates unlimited quizzes on any topic using Google Gemini 1.5 Flash.
- * Secure Authentication:* User registration and login system using **JWT** (JSON Web Tokens) and **Bcrypt**.
- * Progress Tracking:** Saves user quiz history and scores in the database.
- * Review Mode:* Users can review their answers and see correct options after the quiz.
- * Responsive Design:* Works seamlessly on Desktop, Tablet, and Mobile.
- * Performance:* Optimized with strict API rate limiting handling.

---

# Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Atlas) with Mongoose.
- **AI Model:** Google Gemini API (gemini-1.5-flash).
- **Authentication:** JWT & Bcrypt.js.

---

# Screenshots

![Dashboard Screenshot](<img width="1919" height="955" alt="image" src="https://github.com/user-attachments/assets/315e96d5-55c7-4f7b-89d4-8701261c7faf" />
)

# Folder Structure 

ai-quiz-pro/
│
├── models/            # Database Models (User, QuizLog)
├── public/            # Frontend Files (HTML, CSS, JS)
├── .env               # Environment Variables (Not uploaded)
├── .gitignore         # Ignored files
├── server.js          # Main Backend Entry Point
└── package.json       # Project Metadata & Dependencies

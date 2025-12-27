const mongoose = require('mongoose');

const quizLogSchema = new mongoose.Schema({
    topic: { 
        type: String, 
        required: true 
    },
    questions: { 
        type: Array, // Pura quiz data yahan save hoga
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, // User ki ID link karenge
        ref: 'User',
        required: true
    },
    username: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('QuizLog', quizLogSchema);
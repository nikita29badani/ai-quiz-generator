let isRegistering = false;
let quizData = [];
const API_URL = 'http://localhost:3000';

// Check if user is already logged in on page load
window.onload = () => {
    const token = localStorage.getItem('token');
    if (token) {
        const username = localStorage.getItem('username');
        showApp(username);
    }
};

// --- AUTHENTICATION LOGIC ---

function toggleAuthMode() {
    isRegistering = !isRegistering;
    const title = document.getElementById('auth-title');
    const btn = document.getElementById('auth-btn');
    const toggleText = document.getElementById('auth-toggle-text');
    const usernameInput = document.getElementById('username');

    if (isRegistering) {
        title.innerText = "Register";
        btn.innerText = "Register Now";
        toggleText.innerText = "Already have an account? Login";
        usernameInput.classList.remove('hidden');
    } else {
        title.innerText = "Login";
        btn.innerText = "Login";
        toggleText.innerText = "Don't have an account? Register";
        usernameInput.classList.add('hidden');
    }
}

async function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    
    // Validation
    if(!email || !password) return alert("Please fill in all fields.");
    if(isRegistering && !username) return alert("Username is required for registration.");

    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    const payload = isRegistering ? { username, email, password } : { email, password };

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.error) return alert(data.error);

        if (isRegistering) {
            alert("Registration Successful! Please login.");
            toggleAuthMode(); // Switch back to login view
        } else {
            // Login Success
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            showApp(data.username);
        }
    } catch (err) { alert("Server connection failed. Please try again."); }
}

function showApp(username) {
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('app-box').style.display = 'block';
    document.getElementById('user-display').innerText = username;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    location.reload();
}

// --- QUIZ LOGIC ---

async function startQuiz() {
    const topic = document.getElementById('topicInput').value;
    const loading = document.getElementById('loading');
    const generateBtn = document.querySelector('button[onclick="startQuiz()"]'); // Button pakda
    const token = localStorage.getItem('token');

    if (!topic) return alert("Please enter a topic first!");
    
    // UI Update: Loading dikhao aur Button disable karo
    loading.style.display = 'block';
    generateBtn.disabled = true; // <--- YE LINE ADD KARO (Button Disable)
    generateBtn.innerText = "Generating..."; // Text change

    try {
        const response = await fetch(`${API_URL}/generate-quiz`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ topic: topic })
        });

        const data = await response.json();
        
        if (data.error) {
            // Agar limit error aaye toh user ko batao
            if(data.error.includes("429") || data.error.includes("Quota")) {
                alert("Too many requests! Please wait 1 minute before trying again.");
            } else if(data.error.includes("Access Denied")) {
                alert("Session expired. Please login again.");
                logout();
            } else {
                alert("Error: " + data.error);
            }
        } else {
            quizData = data.quiz;
            renderQuestions();
        }
    } catch (err) { 
        alert("Failed to generate quiz. Check your internet or wait a bit."); 
    } finally { 
        // Reset UI
        loading.style.display = 'none'; 
        generateBtn.disabled = false; // <--- Button wapas Chalu
        generateBtn.innerText = "Generate Quiz 🚀"; // Text wapas normal
    }
}

function renderQuestions() {
    document.getElementById('setup-box').style.display = 'none';
    document.getElementById('quiz-box').style.display = 'block';
    
    const container = document.getElementById('questions-container');
    container.innerHTML = ''; 

    quizData.forEach((q, index) => {
        const div = document.createElement('div');
        div.classList.add('question-card');
        div.id = `card-${index}`;
        
        let optionsHtml = '';
        q.options.forEach(opt => {
            optionsHtml += `
                <label class="option-label">
                    <input type="radio" name="q${index}" value="${opt}"> 
                    ${opt}
                </label>
            `;
        });

        div.innerHTML = `
            <h3>Q${index + 1}: ${q.question}</h3>
            <div class="options-box">${optionsHtml}</div>
        `;
        container.appendChild(div);
    });
}

function submitQuiz() {
    let score = 0;
    quizData.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        if (selected && selected.value === q.answer) {
            score++;
        }
    });

    document.getElementById('quiz-box').style.display = 'none';
    document.getElementById('score-box').style.display = 'block';
    document.getElementById('score-display').innerText = score;

    const feedback = document.getElementById('feedback-msg');
    if (score > 8) feedback.innerText = "Outstanding! You are a genius! 🏆";
    else if (score > 5) feedback.innerText = "Good job! You passed. 👍";
    else feedback.innerText = "Keep practicing! You can do better. 📚";
}

function showReview() {
    // Show quiz box again but in Review Mode
    document.getElementById('score-box').style.display = 'none';
    document.getElementById('quiz-box').style.display = 'block';

    // Hide Submit, Show New Quiz button
    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'inline-block';
    document.querySelector('.restart-btn').style.width = '100%';

    quizData.forEach((q, index) => {
        const card = document.getElementById(`card-${index}`);
        const inputs = card.querySelectorAll('input');
        
        inputs.forEach(input => {
            const label = input.parentElement;
            input.disabled = true; // Disable clicking

            // Logic for coloring
            if (input.value === q.answer) {
                label.classList.add('correct'); // Always show correct answer in Green
            } else if (input.checked && input.value !== q.answer) {
                label.classList.add('wrong'); // Show user's wrong selection in Red
            } else {
                label.classList.add('dimmed'); // Dim other options
            }
        });
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetQuizView() {
    location.reload(); 
}
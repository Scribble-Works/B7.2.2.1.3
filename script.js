// --- Utility Function for Answer Normalization ---
function normalizeAnswer(answer) {
    if (!answer) return "";
    
    let normalized = answer.toString().toLowerCase();
    
    // 1. Remove all whitespace
    normalized = normalized.replace(/\s/g, '');
    
    // 2. Standardize fraction and coefficient formatting
    normalized = normalized.replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1/$2)');
    normalized = normalized.replace(/\\cdot/g, '*'); 
    
    // 3. Simplify '1' coefficients (1x -> x) and '1' exponents (x^1 -> x)
    normalized = normalized.replace(/(\W|^)1(\w)/g, '$1$2'); 
    normalized = normalized.replace(/\^1/g, ''); 
    
    return normalized;
}

// Data structure for the 10 questions
const questions = [
    {
        id: 1,
        expression: "(\\frac{1}{2}x) \\cdot (8x^2)",
        correctAnswer: "4x^3" 
    },
    {
        id: 2,
        expression: "\\frac{6.6y^5}{2.2y^2}",
        correctAnswer: "3y^3" 
    },
    {
        id: 3,
        expression: "(-\\frac{2}{3}a^3) \\cdot (\\frac{9}{4}a)",
        correctAnswer: "(-3/2)a^4" 
    },
    {
        id: 4,
        expression: "(0.5m^2n) \\cdot (4m n^3)",
        correctAnswer: "2m^3n^4" 
    },
    {
        id: 5,
        expression: "\\frac{10p}{-\\frac{1}{5}p}",
        correctAnswer: "-50"
    },
    {
        id: 6,
        expression: "(-\\frac{1}{3}k) \\cdot (\\frac{3}{5}j)",
        correctAnswer: "(-1/5)jk"
    },
    {
        id: 7,
        expression: "\\frac{7r^2s^3}{14r^2s}",
        correctAnswer: "(1/2)s^2" 
    },
    {
        id: 8,
        expression: "(0.25t) \\cdot (12t^4)",
        correctAnswer: "3t^5" 
    },
    {
        id: 9,
        expression: "\\frac{-\\frac{4}{5}c^3 d^2}{\\frac{2}{5}c d}",
        correctAnswer: "-2c^2d"
    },
    {
        id: 10,
        expression: "(2.5z^2) \\cdot (0.4z^3)",
        correctAnswer: "z^5"
    }
];

let currentQuestionIndex = 0;
let score = 0;
let answered = false;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizBox = document.getElementById('quiz-box');
const nextBtn = document.getElementById('next-btn');
const resultsScreen = document.getElementById('results');

// 🔊 SOUND HELPER (safe playback)
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {
            // Ignore autoplay errors (allowed after user interaction)
        });
    }
}

function getCurrentElements() {
    return {
        input: document.getElementById('answer-input'),
        submit: document.getElementById('submit-btn'),
        feedback: document.getElementById('feedback')
    };
}

// --- Game Control Functions ---

function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    startScreen.classList.add('hidden');
    quizBox.classList.remove('hidden');
    nextBtn.classList.add('hidden');
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    answered = false;
    nextBtn.classList.add('hidden');
    
    const q = questions[currentQuestionIndex];
    const placeholderText = "Example: Type 4x^3 for the answer 4x³";
    
    quizBox.innerHTML = `
        <h3>Question ${q.id} of 10</h3>
        <p>Simplify the following expression completely:</p>
        <div class="expression">$$${q.expression}$$</div>
        <div id="input-area">
            <input type="text" id="answer-input" placeholder="${placeholderText}" onkeydown="if(event.key === 'Enter') checkAnswer();">
            <button id="submit-btn" onclick="checkAnswer()">Check Answer</button>
        </div>
        <div id="feedback" class="feedback-box hidden"></div>
    `;

    const { input } = getCurrentElements();
    if (input) input.focus();

    // ✅ Render LaTeX
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise([quizBox]).catch(console.warn);
    }
}

function checkAnswer() {
    if (answered) return;

    const { input, submit, feedback } = getCurrentElements();
    if (!input || !submit || !feedback) return;

    const studentAnswer = input.value.trim();
    if (!studentAnswer) {
        feedback.textContent = "Please enter an answer.";
        feedback.className = "feedback-box incorrect-feedback";
        feedback.classList.remove('hidden');
        return;
    }

    const q = questions[currentQuestionIndex];
    const studentNormalized = normalizeAnswer(studentAnswer);
    const correctNormalized = normalizeAnswer(q.correctAnswer);

    answered = true;
    submit.disabled = true;
    nextBtn.classList.remove('hidden');

    if (studentNormalized === correctNormalized) {
        score++;
        feedback.className = "feedback-box correct-feedback";
        feedback.innerHTML = '✅ Correct! Great job simplifying.';
        playSound('correct-sound'); // ✅
    } else {
        feedback.className = "feedback-box incorrect-feedback";
        feedback.innerHTML = `❌ Incorrect. The correct simplified answer is: $$${q.correctAnswer}$$`;
        playSound('wrong-sound'); // ❌
        
        // Re-render LaTeX in feedback
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([feedback]).catch(console.warn);
        }
    }
    feedback.classList.remove('hidden');
}

function nextQuestion() {
    if (!answered) return;
    currentQuestionIndex++;
    displayQuestion();
}

function showResults() {
    quizBox.classList.add('hidden');
    nextBtn.classList.add('hidden');
    document.getElementById('score-display').textContent = score;
    resultsScreen.classList.remove('hidden');
}
// --- Utility Function for Answer Normalization (No Change) ---
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

// Data structure for the 10 questions (No Change)
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

const startScreen = document.getElementById('start-screen');
const quizBox = document.getElementById('quiz-box');
const nextBtn = document.getElementById('next-btn');
const resultsScreen = document.getElementById('results');

function getCurrentElements() {
    return {
        input: document.getElementById('answer-input'),
        submit: document.getElementById('submit-btn'),
        feedback: document.getElementById('feedback')
    };
}

// --- Game Control Functions ---

function startGame() {
    startScreen.classList.add('hidden');
    quizBox.classList.remove('hidden');
    nextBtn.classList.add('hidden'); 
    displayQuestion();
}

function displayQuestion() {
    answered = false;
    nextBtn.classList.add('hidden');
    
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }
    
    const q = questions[currentQuestionIndex];
    
    // --- CRITICAL CHANGE: The placeholder includes the clear instruction ---
    const placeholderText = "Example: Type 4x^3 for the answer 4x³"; 
    
    // Insert the new HTML for the question
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
    
    // Get fresh references to the newly created elements
    const { input } = getCurrentElements();

    // Re-run MathJax rendering
    if (window.MathJax) {
        MathJax.typesetPromise([quizBox]);
    }
    
    // Focus the input field
    if (input) {
        input.focus();
    }
}

function checkAnswer() {
    if (answered) return; 

    // Get fresh references for the check
    const { input, submit, feedback } = getCurrentElements();

    const studentAnswer = input ? input.value : '';
    if (!studentAnswer) {
        alert("Please enter an answer before checking.");
        return;
    }

    const q = questions[currentQuestionIndex];
    
    const studentNormalized = normalizeAnswer(studentAnswer);
    const correctNormalized = normalizeAnswer(q.correctAnswer);
    
    answered = true;
    submit.disabled = true;
    nextBtn.classList.remove('hidden');
    feedback.classList.remove('hidden');

    if (studentNormalized === correctNormalized) {
        score++;
        feedback.classList.remove('incorrect-feedback');
        feedback.classList.add('correct-feedback');
        feedback.innerHTML = '✅ Correct! Great job simplifying.';
    } else {
        feedback.classList.remove('correct-feedback');
        feedback.classList.add('incorrect-feedback');
        
        // Use MathJax to render the correct answer clearly
        feedback.innerHTML = `❌ Incorrect. The correct simplified answer is: $$${q.correctAnswer}$$`;
        
        if (window.MathJax) {
            MathJax.typesetPromise([feedback]);
        }
    }
}

function nextQuestion() {
    if (!answered) return; 
    
    currentQuestionIndex++;
    displayQuestion();
}

function showResults() {
    const currentQuizBox = document.getElementById('quiz-box');
    const currentNextBtn = document.getElementById('next-btn');
    const currentResultsScreen = document.getElementById('results');

    currentQuizBox.classList.add('hidden');
    currentNextBtn.classList.add('hidden');
    
    document.getElementById('score-display').textContent = score;
    currentResultsScreen.classList.remove('hidden');
}
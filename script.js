// Difficulty settings
const difficultySettings = {
    easy: {
        timeLimit: 45,
        dropInterval: 1000,
        winScore: 100,
        dropSpeed: { min: 4, max: 6 }
    },
    normal: {
        timeLimit: 30,
        dropInterval: 800,
        winScore: 150,
        dropSpeed: { min: 3, max: 5 }
    },
    hard: {
        timeLimit: 20,
        dropInterval: 600,
        winScore: 200,
        dropSpeed: { min: 2, max: 4 }
    }
};

let currentDifficulty = 'normal';

// Game state variables
let gameRunning = false;
let dropMaker;
let timerInterval;
let score = 0;
let timeLeft = 30;
let dropsCreated = 0;
let dropsCaught = 0;
let dropsMissed = 0;

// DOM elements
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const messageEl = document.getElementById('message');
const gameContainer = document.getElementById('game-container');

// Event listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

function startGame() {
    if (gameRunning) return;
    
    // Get selected difficulty
    const difficultySelect = document.getElementById('difficulty');
    currentDifficulty = difficultySelect.value;
    const settings = difficultySettings[currentDifficulty];
    
    gameRunning = true;
    startBtn.disabled = true;
    resetBtn.disabled = false;
    difficultySelect.disabled = true;
    
    // Set time based on difficulty
    timeLeft = settings.timeLimit;
    timeEl.textContent = timeLeft;
    
    messageEl.textContent = `${currentDifficulty.toUpperCase()} MODE: Catch the blue drops! Avoid the brown ones!`;
    
    // Start timer
    startTimer();
    
    // Create drops based on difficulty interval
    dropMaker = setInterval(createDrop, settings.dropInterval);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
        
        // Warning messages
        if (timeLeft === 10) {
            messageEl.textContent = '⏰ Only 10 seconds left!';
        }
    }, 1000);
}

function createDrop() {
    if (!gameRunning) return;
    
    dropsCreated++;
    const drop = document.createElement('div');
    drop.className = 'water-drop';
    
    // 25% chance of bad drop
    const isBad = Math.random() < 0.25;
    if (isBad) {
        drop.classList.add('bad-drop');
        drop.dataset.value = '-15';
    } else {
        drop.dataset.value = '10';
    }
    
    // Random size variation
    const initialSize = 60;
    const sizeMultiplier = Math.random() * 0.6 + 0.6;
    const size = initialSize * sizeMultiplier;
    drop.style.width = drop.style.height = `${size}px`;
    
    // Random horizontal position
    const gameWidth = gameContainer.offsetWidth;
    const xPosition = Math.random() * (gameWidth - size);
    drop.style.left = xPosition + 'px';
    
    // Use difficulty-based fall speed
    const settings = difficultySettings[currentDifficulty];
    const fallDuration = Math.random() * (settings.dropSpeed.max - settings.dropSpeed.min) + settings.dropSpeed.min;
    drop.style.animationDuration = `${fallDuration}s`;
    
    // Click handler
    drop.addEventListener('click', (e) => {
        e.stopPropagation();
        catchDrop(drop);
    });
    
    // Remove if not caught
    drop.addEventListener('animationend', () => {
        if (drop.parentElement) {
            dropsMissed++;
            drop.remove();
        }
    });
    
    gameContainer.appendChild(drop);
}

function catchDrop(drop) {
    if (!gameRunning) return;
    
    const value = parseInt(drop.dataset.value);
    const rect = drop.getBoundingClientRect();
    
    // Update score
    score += value;
    scoreEl.textContent = score;
    
    // Show feedback
    showFeedback(rect.left + rect.width/2, rect.top + rect.height/2, value);
    
    // Update message
    if (value > 0) {
        dropsCaught++;
        const messages = [
            '💧 Great catch!',
            '🌊 Clean water secured!',
            '✨ Perfect!',
            '💙 Helping communities!'
        ];
        messageEl.textContent = messages[Math.floor(Math.random() * messages.length)];
    } else {
        const messages = [
            '❌ That was contaminated!',
            '⚠️ Avoid dirty water!',
            '💔 Watch out!'
        ];
        messageEl.textContent = messages[Math.floor(Math.random() * messages.length)];
    }
    
    // Check milestones
    checkMilestones();
    
    // Remove the drop
    drop.remove();
}

function showFeedback(x, y, value) {
    const feedback = document.createElement('div');
    feedback.className = `click-feedback ${value > 0 ? 'positive' : 'negative'}`;
    feedback.textContent = value > 0 ? `+${value}` : value;
    feedback.style.left = x + 'px';
    feedback.style.top = y + 'px';
    feedback.style.position = 'fixed';
    
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 1000);
}

function checkMilestones() {
    if (score === 50) {
        showMilestone('🎉 50 Points! You helped 5 people get clean water!');
    } else if (score === 100) {
        showMilestone('🌟 100 Points! 10 people now have clean water!');
    } else if (score === 200) {
        showMilestone('💫 200 Points! You\'re a water hero!');
    }
}

function showMilestone(text) {
    const milestone = document.createElement('div');
    milestone.className = 'milestone-message';
    milestone.textContent = text;
    document.body.appendChild(milestone);
    setTimeout(() => milestone.remove(), 2000);
}

function endGame() {
    gameRunning = false;
    clearInterval(dropMaker);
    clearInterval(timerInterval);
    startBtn.disabled = false;
    
    // Remove all remaining drops
    const drops = gameContainer.querySelectorAll('.water-drop');
    drops.forEach(drop => drop.remove());
    
    // Calculate accuracy
    const accuracy = dropsCreated > 0 ? Math.round((dropsCaught / dropsCreated) * 100) : 0;
    
    // Get win threshold for current difficulty
    const winThreshold = difficultySettings[currentDifficulty].winScore;
    
    // Final message
    if (score >= winThreshold) {
        messageEl.textContent = `🏆 AMAZING! Score: ${score} | Accuracy: ${accuracy}%`;
        createConfetti();
    } else if (score >= winThreshold * 0.66) {
        messageEl.textContent = `🎊 Great Job! Score: ${score} | Accuracy: ${accuracy}%`;
        createConfetti();
    } else if (score >= winThreshold * 0.33) {
        messageEl.textContent = `👏 Good work! Score: ${score} | Accuracy: ${accuracy}%`;
    } else {
        messageEl.textContent = `Game Over! Score: ${score} | Try again!`;
    }
}

function resetGame() {
    gameRunning = false;
    clearInterval(dropMaker);
    clearInterval(timerInterval);
    
    // Reset all variables
    score = 0;
    timeLeft = 30;
    dropsCreated = 0;
    dropsCaught = 0;
    dropsMissed = 0;
    
    // Update UI
    scoreEl.textContent = score;
    timeEl.textContent = timeLeft;
    messageEl.textContent = 'Click Start to begin your mission!';
    
    // Clear drops
    const drops = gameContainer.querySelectorAll('.water-drop');
    drops.forEach(drop => drop.remove());
    
    // Reset buttons and difficulty selector
    startBtn.disabled = false;
    resetBtn.disabled = true;
    document.getElementById('difficulty').disabled = false;
}

function createConfetti() {
    const colors = ['#FFC907', '#2E9DF7', '#4FCB53', '#FF902A', '#F16061', '#8BD1CB'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (Math.random() * 12 + 6) + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }, i * 20);
    }
}
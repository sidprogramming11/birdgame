const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

// Game variables
let score = 0;
let gameRunning = true;

// Bird object
const bird = {
    x: 50,
    y: 300,
    width: 30,
    height: 25,
    velocityY: 0,
    gravity: 0.4,
    jumpPower: -8,
    color: '#FFD700'
};

// Shark object
const shark = {
    x: 350,
    y: 0,
    width: 40,
    height: 30,
    velocityY: 0,
    gravity: 0.5,
    jumpPower: -12,
    jumping: false,
    jumpCooldown: 0,
    color: '#4A90E2'
};

// Pipes array
let pipes = [];
const pipeGap = 120;
const pipeWidth = 60;

// Input handling
canvas.addEventListener('click', () => {
    if (gameRunning) {
        bird.velocityY = bird.jumpPower;
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameRunning) {
        bird.velocityY = bird.jumpPower;
    }
});

// Draw bird (seagull)
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    
    // Body
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    ctx.arc(8, -5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(11, -6, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(13, -5);
    ctx.lineTo(18, -4);
    ctx.lineTo(13, -3);
    ctx.closePath();
    ctx.fill();
    
    // Wing animation
    ctx.strokeStyle = bird.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-5, -2, 8, 0, Math.PI, false);
    ctx.stroke();
    
    ctx.restore();
}

// Draw shark (jumping from water)
function drawShark() {
    ctx.save();
    ctx.translate(shark.x + shark.width / 2, shark.y + shark.height / 2);
    
    // Body
    ctx.fillStyle = shark.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head (pointed)
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(22, -6);
    ctx.lineTo(22, 6);
    ctx.closePath();
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(12, -6, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(12, -6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Dorsal fin
    ctx.fillStyle = '#1a5f7a';
    ctx.beginPath();
    ctx.moveTo(-5, -10);
    ctx.lineTo(-2, -18);
    ctx.lineTo(0, -10);
    ctx.closePath();
    ctx.fill();
    
    // Tail fin
    ctx.fillStyle = shark.color;
    ctx.beginPath();
    ctx.moveTo(-20, -5);
    ctx.lineTo(-30, -15);
    ctx.lineTo(-25, 0);
    ctx.lineTo(-30, 15);
    ctx.lineTo(-20, 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Draw pipes (obstacles)
function drawPipes() {
    ctx.fillStyle = '#228B22';
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, pipe.y, pipeWidth, pipe.topHeight);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.y + pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.y - pipe.topHeight - pipeGap);
    });
}

// Update bird physics
function updateBird() {
    bird.velocityY += bird.gravity;
    bird.y += bird.velocityY;
    
    // Boundary collision
    if (bird.y + bird.height > canvas.height) {
        endGame();
    }
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocityY = 0;
    }
}

// Update shark (AI jumps to attack bird)
function updateShark() {
    shark.jumpCooldown--;
    
    // Decide when to jump
    if (shark.jumpCooldown <= 0 && Math.random() > 0.98) {
        shark.velocityY = shark.jumpPower;
        shark.jumping = true;
        shark.jumpCooldown = 120; // Cooldown before next jump
    }
    
    // Apply gravity
    shark.velocityY += shark.gravity;
    shark.y += shark.velocityY;
    
    // Keep shark in water area
    if (shark.y + shark.height > canvas.height - 30) {
        shark.y = canvas.height - 30 - shark.height;
        shark.velocityY = 0;
        shark.jumping = false;
    }
}

// Update pipes
function updatePipes() {
    pipes.forEach((pipe, index) => {
        pipe.x -= 3;
        
        // Remove off-screen pipes
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
            score++;
            document.getElementById('score').textContent = score;
        }
    });
    
    // Spawn new pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 150) {
        const topHeight = Math.random() * (canvas.height - pipeGap - 100) + 40;
        pipes.push({
            x: canvas.width,
            y: 0,
            topHeight: topHeight
        });
    }
}

// Collision detection
function checkCollisions() {
    // Bird vs pipes
    pipes.forEach(pipe => {
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth) {
            if (bird.y < pipe.y + pipe.topHeight || bird.y + bird.height > pipe.y + pipe.topHeight + pipeGap) {
                endGame();
            }
        }
    });
    
    // Bird vs shark
    if (bird.x + bird.width > shark.x && bird.x < shark.x + shark.width &&
        bird.y + bird.height > shark.y && bird.y < shark.y + shark.height) {
        endGame();
    }
}

// End game
function endGame() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

// Main game loop
function gameLoop() {
    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw water at bottom
    ctx.fillStyle = '#4A90E2';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    
    // Draw waves
    ctx.strokeStyle = '#87CEEB';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, canvas.height - 30);
        ctx.quadraticCurveTo(i + 10, canvas.height - 35, i + 20, canvas.height - 30);
        ctx.stroke();
    }
    
    if (gameRunning) {
        updateBird();
        updateShark();
        updatePipes();
        checkCollisions();
    }
    
    drawPipes();
    drawBird();
    drawShark();
    
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();

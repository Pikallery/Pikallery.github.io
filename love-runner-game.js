document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById("player");
    const gameContainer = document.getElementById("gameContainer");
    const jumpButton = document.getElementById("jumpButton");
    const scoreDisplay = document.getElementById("score");
    const highscoreDisplay = document.getElementById("highscore");
    const secretMessage = document.getElementById("secretMessage");
    
    // Create restart button since it's referenced but missing in HTML
    const restartButton = document.createElement("button");
    restartButton.id = "restartButton";
    restartButton.textContent = "Play Again";
    restartButton.style.display = "none";
    restartButton.style.background = "#ff4081";
    restartButton.style.color = "white";
    restartButton.style.border = "none";
    restartButton.style.padding = "15px 30px";
    restartButton.style.borderRadius = "50px";
    restartButton.style.fontSize = "1.2rem";
    restartButton.style.margin = "1rem auto";
    restartButton.style.display = "none";
    restartButton.style.cursor = "pointer";
    jumpButton.after(restartButton);

    if (!player || !gameContainer || !jumpButton) {
        console.error("Critical elements missing!");
        return;
    }

    const jumpSound = document.getElementById("jumpSound");
    const gameOverSound = document.getElementById("gameOverSound");
    const shieldSound = document.getElementById("shieldSound");

    let isJumping = false;
    let velocity = 0;
    let gravity = 0.5;
    let jumpForce = -9;
    // Removed movement variables since player now jumps in place
    let originalPosition = 50; // Original left position
    let isGameOver = false;
    let score = 0;
    let highscore = localStorage.getItem("loveRunnerHighscore") || 0;
    let obstacleIntervals = [];
    let obstacleSpeed = 3; // Slowed down from 6 to 3
    
    function initGame() {
        highscoreDisplay.textContent = `Highscore: ${highscore}`;
        if (restartButton) restartButton.style.display = 'none';
        player.style.bottom = "10px";
        player.style.left = `${originalPosition}px`; // Keep position fixed
        player.style.backgroundImage = "url('Anim_Robot_Jump1_v1.gif')"; // Reset player image
        isGameOver = false;
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;

        document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
        obstacleIntervals.forEach(clearInterval);
        obstacleIntervals = [];

        createObstacle();
        gameLoop();
    }

    function jump() {
        if (!isJumping && !isGameOver) {
            isJumping = true;
            velocity = jumpForce;

            // Removed the forward movement logic - player now jumps in place
            
            if (jumpSound) {
                jumpSound.currentTime = 0;
                jumpSound.play().catch(e => console.log("Audio error:", e));
            }
        }
    }

    function updatePlayer() {
        if (!isGameOver) {
            const currentBottom = parseInt(window.getComputedStyle(player).bottom) || 10;
            velocity += gravity;
            const newBottom = Math.max(10, currentBottom - velocity);

            player.style.bottom = `${newBottom}px`;

            if (newBottom <= 10) {
                player.style.bottom = "10px";
                isJumping = false;
                velocity = 0;
            }
        }
    }

    function createObstacle() {
        if (isGameOver) return;

        const obstacle = document.createElement("div");
        obstacle.className = "obstacle";
        obstacle.textContent = "💔";
        obstacle.style.left = `${gameContainer.offsetWidth}px`;
        obstacle.style.bottom = "10px";
        gameContainer.appendChild(obstacle);

        let obstaclePosition = gameContainer.offsetWidth;
        // Using the slower obstacle speed we defined earlier
        const moveSpeed = obstacleSpeed;

        const moveInterval = setInterval(() => {
            if (isGameOver) {
                clearInterval(moveInterval);
                return;
            }

            obstaclePosition -= moveSpeed;
            obstacle.style.left = `${obstaclePosition}px`;

            const playerRect = player.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();

            if (
                playerRect.right > obstacleRect.left + 10 &&
                playerRect.left < obstacleRect.right - 10 &&
                playerRect.bottom > obstacleRect.top + 10 &&
                playerRect.top < obstacleRect.bottom - 10
            ) {
                gameOver();
                clearInterval(moveInterval);
                return;
            }

            if (obstaclePosition < -obstacle.offsetWidth) {
                clearInterval(moveInterval);
                obstacle.remove();
                increaseScore();
            }
        }, 20);

        obstacleIntervals.push(moveInterval);

        if (!isGameOver) {
            setTimeout(createObstacle, 5000 + Math.random() * 4000);
        }
    }

    function increaseScore() {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;

        // Remove confetti on regular score increase

        if (score > highscore) {
            highscore = score;
            localStorage.setItem("loveRunnerHighscore", highscore);
            highscoreDisplay.textContent = `Highscore: ${highscore}`;
            
            // Keep confetti for new high score but reduce amount
            confetti({
                particleCount: 70, // Reduced from 100
                spread: 70, // Reduced from 90
                origin: { y: 0.6 },
                colors: ['#ff4081', '#d81b60', '#ffebee', '#f8bbd0', '#c2185b']
            });
        }

        if (score === 10) {
            secretMessage.style.display = "block";
            
            // Keep celebration for secret message but reduce
            confetti({
                particleCount: 150, // Reduced from 300
                spread: 120, // Reduced from 160
                origin: { y: 0.6 },
                colors: ['#ff4081', '#d81b60', '#ffebee', '#f8bbd0', '#c2185b']
            });
            if (score % 5 === 0) {
    obstacleSpeed += 0.5; // Increase speed every 5 points

          if (shieldSound) {
                shieldSound.play().catch(e => console.log("Audio error:", e));
            }
        }
    }
}

    function gameOver() {
        if (isGameOver) return;

        isGameOver = true;
        if (gameOverSound) {
            gameOverSound.play().catch(e => console.log("Audio error:", e));
        }
        
        // Fix background image syntax
        player.style.backgroundImage = "url('images/Anim_Robot_Walk_v1.gif')";
        if (restartButton) restartButton.style.display = 'block';

        obstacleIntervals.forEach(clearInterval);
        obstacleIntervals = [];
    }

    function gameLoop() {
        updatePlayer();
        if (!isGameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    jumpButton.addEventListener("click", jump);
    if (restartButton) {
        restartButton.addEventListener("click", initGame);
    }
    
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            jump();
        }
    });

    initGame();
});

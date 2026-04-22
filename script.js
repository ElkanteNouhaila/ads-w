const noBtn = document.getElementById("no");
const yesBtn = document.getElementById("yes");
const popup = document.getElementById("popup");
const fireworksCanvas = document.getElementById("fireworksCanvas");
const fireworksCtx = fireworksCanvas.getContext("2d");

const VIEWPORT_PADDING = 16;
const FIREWORK_DURATION_MS = 4200;
const BASE_GRAVITY = 0.045;
let fireworkBursts = [];
let fireworkAnimationId = null;
let fireworkStartTime = 0;
let lastFrameTime = 0;

function moveButton() {
    if (!noBtn.classList.contains("is-escaping")) {
        noBtn.classList.add("is-escaping");
    }

    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;

    const spanX = Math.max(0, window.innerWidth - btnWidth - 2 * VIEWPORT_PADDING);
    const spanY = Math.max(0, window.innerHeight - btnHeight - 2 * VIEWPORT_PADDING);

    const x = VIEWPORT_PADDING + Math.random() * spanX;
    const y = VIEWPORT_PADDING + Math.random() * spanY;

    noBtn.style.left = x + "px";
    noBtn.style.top = y + "px";
}

function resizeFireworksCanvas() {
    const dpr = window.devicePixelRatio || 1;
    fireworksCanvas.width = Math.floor(window.innerWidth * dpr);
    fireworksCanvas.height = Math.floor(window.innerHeight * dpr);
    fireworksCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function createBurst(x, y) {
    const particles = [];
    const particleCount = Math.floor(randomBetween(55, 90));
    const hue = Math.floor(randomBetween(0, 360));

    for (let i = 0; i < particleCount; i += 1) {
        const angle = randomBetween(0, Math.PI * 2);
        const speed = randomBetween(1.8, 6.4);
        const life = randomBetween(70, 125);

        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life,
            maxLife: life,
            size: randomBetween(1.2, 3.4),
            hue: (hue + randomBetween(-26, 26) + 360) % 360,
        });
    }

    return particles;
}

function spawnRandomBurst() {
    const burstX = randomBetween(window.innerWidth * 0.12, window.innerWidth * 0.88);
    const burstY = randomBetween(window.innerHeight * 0.12, window.innerHeight * 0.58);
    fireworkBursts.push(createBurst(burstX, burstY));
}

function updateAndDrawBursts() {
    fireworksCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    fireworkBursts = fireworkBursts
        .map((burst) => {
            burst.forEach((particle) => {
                particle.vx *= 0.986;
                particle.vy += BASE_GRAVITY;
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life -= 1;

                const alpha = Math.max(0, particle.life / particle.maxLife);
                fireworksCtx.beginPath();
                fireworksCtx.fillStyle = `hsla(${particle.hue}, 95%, 62%, ${alpha})`;
                fireworksCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                fireworksCtx.fill();
            });

            return burst.filter((particle) => particle.life > 0);
        })
        .filter((burst) => burst.length > 0);
}

function animateFireworks(timestamp) {
    if (!lastFrameTime) {
        lastFrameTime = timestamp;
    }

    const elapsed = timestamp - fireworkStartTime;
    const frameDelta = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (frameDelta > 150 && elapsed < FIREWORK_DURATION_MS - 600) {
        spawnRandomBurst();
    } else if (Math.random() < 0.1 && elapsed < FIREWORK_DURATION_MS - 700) {
        spawnRandomBurst();
    }

    updateAndDrawBursts();

    if (elapsed < FIREWORK_DURATION_MS || fireworkBursts.length > 0) {
        fireworkAnimationId = window.requestAnimationFrame(animateFireworks);
        return;
    }

    fireworksCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    fireworkAnimationId = null;
    lastFrameTime = 0;
}

function startFireworks() {
    if (fireworkAnimationId) {
        window.cancelAnimationFrame(fireworkAnimationId);
        fireworkAnimationId = null;
    }

    resizeFireworksCanvas();
    fireworksCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    fireworkBursts = [];
    fireworkStartTime = performance.now();
    lastFrameTime = 0;

    for (let i = 0; i < 4; i += 1) {
        spawnRandomBurst();
    }

    fireworkAnimationId = window.requestAnimationFrame(animateFireworks);
}

resizeFireworksCanvas();
window.addEventListener("resize", resizeFireworksCanvas);

noBtn.addEventListener("mouseover", moveButton);
noBtn.addEventListener("touchstart", moveButton);

yesBtn.addEventListener("click", () => {
    startFireworks();
    popup.style.display = "flex";
    popup.classList.remove("popup--entered");
    void popup.offsetWidth;
    popup.classList.add("popup--entered");
});
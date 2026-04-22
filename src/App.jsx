import { useEffect, useRef, useState } from "react";

const VIEWPORT_PADDING = 16;
const FIREWORK_DURATION_MS = 4200;
const BASE_GRAVITY = 0.045;

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

export default function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupEntered, setPopupEntered] = useState(false);
  const [noEscaping, setNoEscaping] = useState(false);
  const [noPosition, setNoPosition] = useState({ left: 0, top: 0 });

  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const burstsRef = useRef([]);
  const fireworkStartTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        window.cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const spawnRandomBurst = () => {
    const burstX = randomBetween(window.innerWidth * 0.12, window.innerWidth * 0.88);
    const burstY = randomBetween(window.innerHeight * 0.12, window.innerHeight * 0.58);
    burstsRef.current.push(createBurst(burstX, burstY));
  };

  const updateAndDrawBursts = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    burstsRef.current = burstsRef.current
      .map((burst) => {
        burst.forEach((particle) => {
          particle.vx *= 0.986;
          particle.vy += BASE_GRAVITY;
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life -= 1;

          const alpha = Math.max(0, particle.life / particle.maxLife);
          ctx.beginPath();
          ctx.fillStyle = `hsla(${particle.hue}, 95%, 62%, ${alpha})`;
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });
        return burst.filter((particle) => particle.life > 0);
      })
      .filter((burst) => burst.length > 0);
  };

  const animateFireworks = (timestamp) => {
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }

    const elapsed = timestamp - fireworkStartTimeRef.current;
    const frameDelta = timestamp - lastFrameTimeRef.current;
    lastFrameTimeRef.current = timestamp;

    if (frameDelta > 150 && elapsed < FIREWORK_DURATION_MS - 600) {
      spawnRandomBurst();
    } else if (Math.random() < 0.1 && elapsed < FIREWORK_DURATION_MS - 700) {
      spawnRandomBurst();
    }

    updateAndDrawBursts();

    if (elapsed < FIREWORK_DURATION_MS || burstsRef.current.length > 0) {
      animationIdRef.current = window.requestAnimationFrame(animateFireworks);
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }
    animationIdRef.current = null;
    lastFrameTimeRef.current = 0;
  };

  const startFireworks = () => {
    if (animationIdRef.current) {
      window.cancelAnimationFrame(animationIdRef.current);
    }

    burstsRef.current = [];
    fireworkStartTimeRef.current = performance.now();
    lastFrameTimeRef.current = 0;

    for (let i = 0; i < 4; i += 1) {
      spawnRandomBurst();
    }

    animationIdRef.current = window.requestAnimationFrame(animateFireworks);
  };

  const moveNoButton = () => {
    if (!noEscaping) {
      setNoEscaping(true);
    }

    const button = document.getElementById("no");
    if (!button) return;

    const btnWidth = button.offsetWidth;
    const btnHeight = button.offsetHeight;

    const spanX = Math.max(0, window.innerWidth - btnWidth - 2 * VIEWPORT_PADDING);
    const spanY = Math.max(0, window.innerHeight - btnHeight - 2 * VIEWPORT_PADDING);

    const x = VIEWPORT_PADDING + Math.random() * spanX;
    const y = VIEWPORT_PADDING + Math.random() * spanY;

    setNoPosition({ left: x, top: y });
  };

  const handleYesClick = () => {
    startFireworks();
    setShowPopup(true);
    setPopupEntered(false);
    requestAnimationFrame(() => setPopupEntered(true));
  };

  return (
    <>
      <img src="/bg_vega8.png" alt="Vega 8" className="logo" />

      <div className="container" id="container">
        <h1>wach bghiti t9ad site web 3and vega 8 ??</h1>
        <div className="buttons-row">
          <button type="button" id="yes" onClick={handleYesClick}>
            Oui 
          </button>
          <button
            type="button"
            id="no"
            className={noEscaping ? "is-escaping" : ""}
            style={noEscaping ? { left: `${noPosition.left}px`, top: `${noPosition.top}px` } : undefined}
            onMouseOver={moveNoButton}
            onTouchStart={moveNoButton}
          >
            Non 
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} id="fireworksCanvas" className="fireworks-canvas" aria-hidden="true" />

      <div className={`popup ${showPopup ? "popup--visible" : ""} ${popupEntered ? "popup--entered" : ""}`} id="popup">
        <div className="popup-card">
          <h2 className="popup-title">Félicitations 😍</h2>
          <p>mar7ba beeek</p>
        </div>
      </div>
    </>
  );
}

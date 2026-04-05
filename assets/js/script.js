
// ── Background hearts ─────────────────────────────────────────
const bgEl = document.getElementById("bg-hearts");
const ePool = ["♥", "💕", "💗", "💓", "🌹", "✿", "❣", "💞"];
for (let i = 0; i < 28; i++) {
    const h = document.createElement("div");
    h.className = "bg-heart";
    h.textContent = ePool[Math.floor(Math.random() * ePool.length)];
    h.style.left = Math.random() * 100 + "vw";
    h.style.fontSize = 0.7 + Math.random() * 1.3 + "rem";
    h.style.animationDuration = 9 + Math.random() * 13 + "s";
    h.style.animationDelay = Math.random() * 14 + "s";
    bgEl.appendChild(h);
}

// ── Audio ─────────────────────────────────────────────────────
// Strategy: attempt play on EVERY early touch/click until it works.
// iOS Safari only allows audio.play() inside a direct user-gesture handler.
// The first touchstart on the popup IS a user gesture — we hook it there.
const audio = document.getElementById("bg-audio");
const badge = document.getElementById("audio-badge");
let audioStarted = false;

function tryPlay() {
    if (audioStarted) return;
    const p = audio.play();
    if (p !== undefined) {
        p.then(() => {
            audioStarted = true;
        }).catch(() => { }); // silently fail; will retry on next gesture
    }
}

// Hook onto every possible early interaction
["touchstart", "touchend", "click"].forEach((ev) =>
    document.addEventListener(ev, tryPlay, { passive: true }),
);

// Show decorative badge after 1.5 s (always visible, just cosmetic)
setTimeout(() => badge.classList.add("show"), 1500);

// ── Countdown 25 s ────────────────────────────────────────────
const continueBtn = document.getElementById("continue-btn");
const countdownText = document.getElementById("countdown-text");
let secs = 25;

const ticker = setInterval(() => {
    secs--;
    if (secs > 0) {
        countdownText.textContent = `espera ${secs}s...`;
    } else {
        clearInterval(ticker);
        countdownText.classList.add("hidden");
        continueBtn.disabled = false;
        continueBtn.classList.add("active");
        document.querySelector(".popup-card").classList.add("active");
    }
}, 1000);

// ── Popup → Main ──────────────────────────────────────────────
continueBtn.addEventListener("click", () => {
    if (!continueBtn.classList.contains("active")) return;
    tryPlay(); // user gesture = best chance for iOS autoplay
    const overlay = document.getElementById("popup-overlay");
    overlay.style.transition = "opacity 1s ease";
    overlay.style.opacity = "0";
    setTimeout(() => {
        overlay.style.display = "none";
        document.getElementById("main-page").classList.add("visible");
        alignNoBtn();
    }, 1000);
});

// ── NO button — position & escape ─────────────────────────────
const btnNo = document.getElementById("btn-no");
const btnNoPh = document.getElementById("btn-no-ph");
let noEscapes = 0;

function alignNoBtn() {
    // Place NO exactly where the placeholder sits
    const r = btnNoPh.getBoundingClientRect();
    const bh = btnNo.offsetHeight || 54;
    btnNo.style.left = r.left + "px";
    btnNo.style.top = r.top + (r.height - bh) / 2 + "px";
    btnNo.style.display = "block";
}

function escapeNoBtn(e) {
    e.preventDefault();
    noEscapes++;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bw = btnNo.offsetWidth || 100;
    const bh = btnNo.offsetHeight || 54;

    // Four corner zones far from center, safe-area aware
    const margin = 16;
    const topSafe = margin + (window.screen.height - vh) / 2; // rough safe area top
    const bottomSafe = vh - margin - bh;

    const zones = [
        () => ({ x: margin, y: topSafe + Math.random() * vh * 0.25 }),
        () => ({
            x: vw - bw - margin,
            y: topSafe + Math.random() * vh * 0.25,
        }),
        () => ({ x: margin, y: bottomSafe - Math.random() * vh * 0.25 }),
        () => ({
            x: vw - bw - margin,
            y: bottomSafe - Math.random() * vh * 0.25,
        }),
        () => ({ x: vw * 0.5 - bw / 2, y: topSafe }),
        () => ({ x: vw * 0.5 - bw / 2, y: bottomSafe }),
    ];

    let { x, y } = zones[Math.floor(Math.random() * zones.length)]();
    x = Math.min(Math.max(x, margin), vw - bw - margin);
    y = Math.min(Math.max(y, margin), vh - bh - margin);

    btnNo.style.left = x + "px";
    btnNo.style.top = y + "px";

    // Shrink & fade after repeated taps
    if (noEscapes > 3) {
        const s = Math.max(0.4, 1 - (noEscapes - 3) * 0.1);
        const op = Math.max(0.1, 0.65 - (noEscapes - 3) * 0.09);
        btnNo.style.transform = `scale(${s})`;
        btnNo.style.opacity = String(op);
    }
}

// MOBILE ONLY: touchstart is more responsive than mouseenter, and we want to catch taps as well as swipes
btnNo.addEventListener("mouseenter", escapeNoBtn);
btnNo.addEventListener("touchstart", escapeNoBtn, { passive: false });

// ── SÍ button ─────────────────────────────────────────────────
document.getElementById("btn-si").addEventListener("click", () => {
    tryPlay();
    launchHearts(30);
    setTimeout(() => {
        document.getElementById("main-page").classList.remove("visible");
        document.getElementById("success-screen").classList.add("visible");
        btnNo.style.display = "none";
        badge.style.opacity = "0"; // hide badge on success
        launchHeartsLoop();
    }, 700);
});

// ── Flying hearts ─────────────────────────────────────────────
const heartEmojis = [
    "💖",
    "💗",
    "💕",
    "💓",
    "🌹",
    "❤️",
    "💘",
    "💝",
    "🌸",
];

function launchHearts(count = 20) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const h = document.createElement("div");
            h.className = "flying-heart";
            h.textContent =
                heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            h.style.left = 5 + Math.random() * 88 + "vw";
            h.style.bottom = "-2rem";
            h.style.fontSize = 1.4 + Math.random() * 2.4 + "rem";
            h.style.setProperty("--rot", Math.random() * 60 - 30 + "deg");
            h.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
            document.body.appendChild(h);
            setTimeout(() => h.remove(), 3800);
        }, i * 65);
    }
}

function launchHeartsLoop() {
    setInterval(() => launchHearts(10), 1000);
}

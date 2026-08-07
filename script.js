/* =========================================================================
   FOR ZAHA — script.js
   Handles: section flow, particles, audio, cake wish, memory gallery,
   letter reveal, confetti, replay. Everything fails gracefully if an
   image or audio file is missing.
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     STATE
     --------------------------------------------------------------------- */
  const SECTION_ORDER = [
    "welcome", "intro", "photo", "date", "cake", "celebrate",
    "memories", "quotes", "pause", "letter", "final", "forever"
  ];

  const state = {
    currentIndex: 0,
    audioUnlocked: false,
    musicPlaying: false,
    muted: false,
    memoryIndex: 0,
    memoryCount: 7,
    wishMade: false,
    letterOpened: false,
    letterRevealed: false,
    transitioning: false
  };

  const MEMORY_CAPTIONS = [
    "And somehow, this became one of my favorite moments.",
    "I wish I could pause this moment and keep it forever.",
    "A simple memory\u2026 with a very special person.",
    "Some pictures hold feelings that words can't explain.",
    "If I could relive one little moment, maybe I'd choose this one.",
    "You turned ordinary moments into memories worth keeping.",
    "And this is only one chapter of our story."
  ];

  const LETTER_PARAGRAPHS = [
  "My Love,",
  "Happy Birthday to the person who has become such a beautiful part of my world. 🤍",
  "I don't know if words can ever explain how much you mean to me, but I want you to know that you are more than just someone I love — you are a feeling, a comfort, and a smile I never get tired of.",
  "I pray this new year of your life brings you endless happiness, peace, success, and everything your heart wishes for.",
  "May Allah bless you always, protect your beautiful heart, guide you towards everything good, and fill your life with countless reasons to smile. 🤲🏻🤍",
  "And selfishly… I hope I get to be part of many of those beautiful moments. 🥹💗",
  "More laughs. More memories. More silly conversations. More little surprises. And hopefully, a beautiful story that we can look back on one day and say, “We really made it.” 🥹🤍",
  "Happy Birthday, Zaha. 🎂🤍",
  "Thank you for being you. And thank you for existing in this world.",
  "My prayers will always be with you, wherever life takes us.",
  "Allah bless you always, my love. 🤲🏻💗 Femanillah.",
  "__SIGNATURE__With all my heart,|Rasath 🤍"
];

  /* ---------------------------------------------------------------------
     UTILITIES
     --------------------------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function safePlay(audioEl, opts) {
    if (!audioEl) return;
    try {
      opts = opts || {};
      if (typeof opts.volume === "number") audioEl.volume = state.muted ? 0 : opts.volume;
      if (opts.restart) { audioEl.currentTime = 0; }
      const p = audioEl.play();
      if (p && typeof p.catch === "function") {
        p.catch(function () { /* autoplay blocked or file missing — silently continue */ });
      }
    } catch (e) { /* graceful no-op */ }
  }

  function playSound(id, volume) {
    const el = document.getElementById(id);
    safePlay(el, { volume: volume, restart: true });
  }

  function staggerReveal(container, selector, delayStep) {
    const els = $all(selector, container);
    els.forEach(function (el, i) {
      setTimeout(function () { el.classList.add("in"); }, i * (delayStep || 220));
    });
  }

  /* ---------------------------------------------------------------------
     PARTICLE SYSTEM — ambient canvas stars + drifting particles
     --------------------------------------------------------------------- */
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  let particles = [];
  let canvasW = 0, canvasH = 0;
  let particleDensity = window.innerWidth < 640 ? 40 : 80;

  function resizeCanvas() {
    if (!canvas) return;
    canvasW = canvas.width = window.innerWidth;
    canvasH = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * canvasW,
      y: Math.random() * canvasH,
      r: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.15 + 0.03,
      drift: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.5 + 0.15,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2
    };
  }

  function initParticles() {
    if (!ctx) return;
    particles = [];
    for (let i = 0; i < particleDensity; i++) particles.push(makeParticle());
  }

  let rafId = null;
  let frameTick = 0;
  function animateParticles() {
    if (!ctx) return;
    frameTick++;
    ctx.clearRect(0, 0, canvasW, canvasH);
    particles.forEach(function (p) {
      const twinkle = 0.5 + 0.5 * Math.sin(frameTick * p.pulseSpeed + p.pulseOffset);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,244,234," + (p.alpha * twinkle).toFixed(3) + ")";
      ctx.fill();
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -10) { p.y = canvasH + 10; p.x = Math.random() * canvasW; }
      if (p.x < -10) p.x = canvasW + 10;
      if (p.x > canvasW + 10) p.x = -10;
    });
    rafId = requestAnimationFrame(animateParticles);
  }

  function startParticleLoop() {
    if (!ctx || rafId) return;
    animateParticles();
  }

  /* ---------------------------------------------------------------------
     FLOATING HEARTS (DOM based, lightweight)
     --------------------------------------------------------------------- */
  const heartsLayer = document.getElementById("floating-hearts");
  let heartsIntervalId = null;

  function heartSVG(color, size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 32 29" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M16 28.5S1 18.6 1 9.6C1 4.6 4.9 1 9.3 1c2.7 0 5.2 1.4 6.7 3.6C17.5 2.4 20 1 22.7 1 27.1 1 31 4.6 31 9.6c0 9-15 18.9-15 18.9z" ' +
      'fill="' + color + '" opacity="0.85"/></svg>';
  }

  function spawnHeart() {
    if (!heartsLayer || document.hidden) return;
    const el = document.createElement("div");
    el.className = "floating-heart";
    const colors = ["#f7d9de", "#e3a9b4", "#d6c3ef", "#e8c88a"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 14 + Math.random() * 18;
    el.innerHTML = heartSVG(color, size);
    el.style.left = Math.random() * 96 + "vw";
    const duration = 9 + Math.random() * 8;
    el.style.animationDuration = duration + "s";
    el.style.setProperty("--drift", (Math.random() * 60 - 30) + "px");
    heartsLayer.appendChild(el);
    setTimeout(function () { el.remove(); }, duration * 1000 + 500);
  }

  function startHeartLoop(intervalMs) {
    if (heartsIntervalId) clearInterval(heartsIntervalId);
    heartsIntervalId = setInterval(spawnHeart, intervalMs || 2200);
  }

  /* ---------------------------------------------------------------------
     SECTION NAVIGATION
     --------------------------------------------------------------------- */
  function getSectionEl(name) { return document.getElementById("sec-" + name); }

  function runSectionEnterEffects(name) {
    const el = getSectionEl(name);
    if (!el) return;

    switch (name) {
      case "intro":
        showIntro();
        break;
      case "photo":
        staggerReveal(el, ".reveal-el", 260);
        playSound("audio-sparkle", 0.18);
        break;
      case "date":
        staggerReveal(el, ".reveal-el", 260);
        break;
      case "cake":
        staggerReveal(el, ".reveal-el", 220);
        initCake();
        playSound("audio-cake", 0.25);
        break;
      case "celebrate":
        staggerReveal(el, ".reveal-el", 260);
        break;
      case "memories":
        staggerReveal(el, ".reveal-el", 200);
        initMemories();
        playSound("audio-heartbeat", 0.12);
        break;
      case "quotes":
        staggerReveal(el, ".reveal-el", 420);
        break;
      case "pause":
        staggerReveal(el, ".reveal-el", 500);
        playSound("audio-heartbeat", 0.1);
        break;
      case "letter":
        /* letter flow handled via its own buttons */
        break;
      case "final":
        showFinalMessage();
        break;
      case "forever":
        staggerReveal(el, ".reveal-el", 350);
        break;
      default:
        break;
    }
  }

  function goToSection(name, opts) {
    if (state.transitioning) return;
    const targetIndex = SECTION_ORDER.indexOf(name);
    if (targetIndex === -1) return;

    const currentName = SECTION_ORDER[state.currentIndex];
    const currentEl = getSectionEl(currentName);
    const nextEl = getSectionEl(name);
    if (!nextEl) return;

    state.transitioning = true;

    if (opts && opts.pageFlip) playSound("audio-pageflip", 0.2);

    if (currentEl && currentEl !== nextEl) {
      currentEl.classList.add("leaving");
      setTimeout(function () {
        currentEl.classList.remove("active", "leaving");
        nextEl.classList.add("active");
        state.currentIndex = targetIndex;
        runSectionEnterEffects(name);
        state.transitioning = false;
      }, 480);
    } else {
      nextEl.classList.add("active");
      state.currentIndex = targetIndex;
      runSectionEnterEffects(name);
      state.transitioning = false;
    }
  }

  /* wire up every [data-next] button */
  function initNextButtons() {
    $all("[data-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        rippleEffect(btn);
        goToSection(btn.getAttribute("data-next"), { pageFlip: true });
      });
    });
  }

  function rippleEffect(btn) {
    btn.classList.remove("rippling");
    void btn.offsetWidth; /* restart animation */
    btn.classList.add("rippling");
  }

  /* ---------------------------------------------------------------------
     SECTION: INTRO — line by line reveal
     --------------------------------------------------------------------- */
  function showIntro() {
    const el = getSectionEl("intro");
    if (!el) return;
    const lines = $all(".intro-line", el);
    lines.forEach(function (line, i) {
      setTimeout(function () {
        line.classList.add("in");
        if (i === lines.length - 1) {
          setTimeout(function () {
            playSound("audio-sparkle", 0.15);
            goToSection("photo", { pageFlip: false });
          }, 1600);
        }
      }, i * 1400);
    });
  }

  /* ---------------------------------------------------------------------
     SECTION: CAKE — the wish interaction
     --------------------------------------------------------------------- */
  function initCake() {
    const btn = document.getElementById("btn-wish");
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", function () {
      if (state.wishMade) return;
      state.wishMade = true;
      rippleEffect(btn);

      $all(".candle-group").forEach(function (c, i) {
        setTimeout(function () { c.classList.add("blown"); }, i * 120);
      });

      playSound("audio-candle", 0.35);
      setTimeout(function () { startConfetti(18); }, 200);
      setTimeout(function () { playSound("audio-sparkle", 0.2); }, 300);

      setTimeout(function () {
        btn.classList.add("spent");
        const after = document.getElementById("cake-aftermath");
        if (after) after.classList.add("show");
      }, 700);

      setTimeout(function () {
        goToSection("celebrate", { pageFlip: false });
      }, 3600);
    });
  }

  /* ---------------------------------------------------------------------
     CONFETTI — elegant slow-motion burst
     --------------------------------------------------------------------- */
  function startConfetti(count) {
    const colors = ["#f7d9de", "#e3a9b4", "#d6c3ef", "#e8c88a", "#fbf4ea"];
    const n = count || 40;
    for (let i = 0; i < n; i++) {
      setTimeout(function () {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        const isHeart = Math.random() < 0.3;
        const size = 6 + Math.random() * 8;
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.width = size + "px";
        piece.style.height = isHeart ? size + "px" : size * 1.6 + "px";
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        if (isHeart) piece.style.borderRadius = "50% 50% 50% 0";
        piece.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
        piece.style.setProperty("--spin", (Math.random() * 500 - 250) + "deg");
        const duration = 4 + Math.random() * 3;
        piece.style.animationDuration = duration + "s";
        document.body.appendChild(piece);
        setTimeout(function () { piece.remove(); }, duration * 1000 + 300);
      }, i * 60);
    }
  }

  /* ---------------------------------------------------------------------
     SECTION: MEMORIES — cinematic photo gallery
     --------------------------------------------------------------------- */
  function initMemories() {
    const prevBtn = document.getElementById("mem-prev");
    const nextBtn = document.getElementById("mem-next");
    const frame = document.getElementById("memory-frame");
    if (!prevBtn || prevBtn.dataset.bound) return;

    prevBtn.dataset.bound = "true";
    nextBtn.dataset.bound = "true";

    prevBtn.addEventListener("click", previousMemory);
    nextBtn.addEventListener("click", nextMemory);

    document.addEventListener("keydown", function (e) {
      const memoriesActive = getSectionEl("memories").classList.contains("active");
      if (!memoriesActive) return;
      if (e.key === "ArrowRight") nextMemory();
      if (e.key === "ArrowLeft") previousMemory();
    });

    /* touch swipe */
    let touchStartX = 0;
    frame.addEventListener("touchstart", function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    frame.addEventListener("touchend", function (e) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) nextMemory(); else previousMemory();
      }
    }, { passive: true });

    renderMemory();
  }

  function renderMemory() {
    const img = document.getElementById("memory-img");
    const frame = document.getElementById("memory-frame");
    const indexLabel = document.getElementById("memory-index");
    const caption = document.getElementById("memory-caption");
    if (!img) return;

    frame.classList.remove("img-missing");
    const fileName = "me" + (state.memoryIndex + 1) + ".jpg";
    img.src = fileName;
    img.alt = "Memory " + (state.memoryIndex + 1);

    const num = String(state.memoryIndex + 1).padStart(2, "0");
    indexLabel.textContent = "Memory " + num + " / 0" + state.memoryCount;
    caption.textContent = MEMORY_CAPTIONS[state.memoryIndex] || "";
  }

  function nextMemory() {
    state.memoryIndex = (state.memoryIndex + 1) % state.memoryCount;
    playSound("audio-pageflip", 0.18);
    renderMemory();
  }

  function previousMemory() {
    state.memoryIndex = (state.memoryIndex - 1 + state.memoryCount) % state.memoryCount;
    playSound("audio-pageflip", 0.18);
    renderMemory();
  }

  /* ---------------------------------------------------------------------
     SECTION: PAUSE -> LETTER
     --------------------------------------------------------------------- */
  function bindOpenHeart() {
    const btn = document.getElementById("btn-open-heart");
    if (!btn) return;
    btn.addEventListener("click", function () {
      rippleEffect(btn);
      goToSection("letter", { pageFlip: false });
    });
  }

  function bindEnvelope() {
    const envelope = document.getElementById("envelope");
    const openBtn = document.getElementById("btn-open-letter");
    if (!openBtn) return;
    openBtn.addEventListener("click", function () {
      if (state.letterOpened) return;
      state.letterOpened = true;
      rippleEffect(openBtn);
      envelope.classList.add("opening");
      playSound("audio-letter", 0.3);
      setTimeout(function () {
        envelope.classList.add("opened");
        openLetter();
      }, 650);
    });
  }

  function openLetter() {
    const card = document.getElementById("letter-card");
    if (!card) return;
    card.classList.add("show");
    setTimeout(revealLetter, 400);
  }

  function revealLetter() {
    if (state.letterRevealed) return;
    state.letterRevealed = true;
    const inner = document.getElementById("letter-inner");
    const continueBtn = document.getElementById("btn-letter-continue");
    if (!inner) return;

    inner.innerHTML = "";
    let delay = 0;
    LETTER_PARAGRAPHS.forEach(function (para) {
      const p = document.createElement("p");
      if (para.indexOf("__SIGNATURE__") === 0) {
        const parts = para.replace("__SIGNATURE__", "").split("|");
        p.innerHTML = parts[0] + "<br><span class=\"l-sig\">" + parts[1] + "</span>";
      } else {
        p.textContent = para;
      }
      p.style.animationDelay = delay + "ms";
      inner.appendChild(p);
      delay += 260;
    });

    setTimeout(function () {
      if (continueBtn) {
        continueBtn.classList.remove("hidden");
        continueBtn.addEventListener("click", function () {
          rippleEffect(continueBtn);
          goToSection("final", { pageFlip: true });
        }, { once: true });
      }
    }, delay + 500);
  }

  /* ---------------------------------------------------------------------
     SECTION: FINAL MESSAGE
     --------------------------------------------------------------------- */
  function showFinalMessage() {
    const el = getSectionEl("final");
    if (!el) return;
    const lines = $all(".final-line", el);
    lines.forEach(function (line, i) {
      setTimeout(function () {
        line.classList.add("in");
        if (i === 1) playSound("audio-finallove", 0.22);
        if (i === lines.length - 1) {
          setTimeout(function () { goToSection("forever", { pageFlip: false }); }, 2400);
        }
      }, i * 1300);
    });
  }

  /* ---------------------------------------------------------------------
     REPLAY
     --------------------------------------------------------------------- */
  function replayExperience() {
    /* reset section states */
    SECTION_ORDER.forEach(function (name) {
      const el = getSectionEl(name);
      if (el) el.classList.remove("active", "leaving");
    });
    $all(".reveal-el, .intro-line, .final-line").forEach(function (el) {
      el.classList.remove("in");
    });

    state.memoryIndex = 0;
    state.wishMade = false;
    state.letterOpened = false;
    state.letterRevealed = false;
    state.currentIndex = 0;

    const cakeBtn = document.getElementById("btn-wish");
    if (cakeBtn) cakeBtn.classList.remove("spent");
    const cakeAfter = document.getElementById("cake-aftermath");
    if (cakeAfter) cakeAfter.classList.remove("show");
    $all(".candle-group").forEach(function (c) { c.classList.remove("blown"); });

    const envelope = document.getElementById("envelope");
    if (envelope) envelope.classList.remove("opened", "opening");
    const letterCard = document.getElementById("letter-card");
    if (letterCard) letterCard.classList.remove("show");
    const letterInner = document.getElementById("letter-inner");
    if (letterInner) letterInner.innerHTML = "";
    const continueBtn = document.getElementById("btn-letter-continue");
    if (continueBtn) continueBtn.classList.add("hidden");

    getSectionEl("welcome").classList.add("active");
    const welcomeCard = $(".welcome-card", getSectionEl("welcome"));
    if (welcomeCard) welcomeCard.classList.add("in");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------------------------------------------------------------------
     AUDIO CONTROL BUTTON
     --------------------------------------------------------------------- */
  function initMusicToggle() {
    const btn = document.getElementById("music-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      const music = document.getElementById("audio-music");
      if (state.muted) {
        state.muted = false;
        btn.classList.remove("muted");
        safePlay(music, { volume: 0.2 });
        state.musicPlaying = true;
      } else if (state.musicPlaying) {
        state.muted = true;
        btn.classList.add("muted");
        if (music) music.volume = 0;
      } else {
        state.musicPlaying = true;
        safePlay(music, { volume: 0.2 });
      }
    });
  }

  /* ---------------------------------------------------------------------
     BEGIN EXPERIENCE
     --------------------------------------------------------------------- */
  function startExperience() {
    state.audioUnlocked = true;
    playSound("audio-chime", 0.4);
    const music = document.getElementById("audio-music");
    safePlay(music, { volume: 0.2 });
    state.musicPlaying = true;

    const musicBtn = document.getElementById("music-toggle");
    if (musicBtn) musicBtn.classList.remove("hidden");

    startHeartLoop(1400);

    setTimeout(function () {
      goToSection("intro", { pageFlip: false });
    }, 900);
  }

  function bindBeginButton() {
    const btn = document.getElementById("btn-begin");
    if (!btn) return;
    btn.addEventListener("click", function () {
      rippleEffect(btn);
      btn.disabled = true;
      startExperience();
    }, { once: true });
  }

  /* ---------------------------------------------------------------------
     INIT
     --------------------------------------------------------------------- */
  function initWebsite() {
    resizeCanvas();
    initParticles();
    startParticleLoop();
    startHeartLoop(3600); /* gentle ambient hearts even before start */

    window.addEventListener("resize", function () {
      resizeCanvas();
      particleDensity = window.innerWidth < 640 ? 40 : 80;
      initParticles();
    });

    bindBeginButton();
    initNextButtons();
    bindOpenHeart();
    bindEnvelope();
    initMusicToggle();

    const replayBtn = document.getElementById("btn-replay");
    if (replayBtn) replayBtn.addEventListener("click", function () {
      rippleEffect(replayBtn);
      replayExperience();
    });

    /* first screen reveal */
    const welcomeCard = $(".welcome-card");
    if (welcomeCard) requestAnimationFrame(function () { welcomeCard.classList.add("in"); });

    getSectionEl("welcome").classList.add("active");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWebsite);
  } else {
    initWebsite();
  }
})();

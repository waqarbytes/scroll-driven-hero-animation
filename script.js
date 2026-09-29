document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const carWrapper = document.getElementById('carWrapper');
  const carTrail = document.getElementById('carTrail');
  const roadSurface = document.getElementById('roadSurface');
  const heroSection = document.getElementById('heroSection');
  const letters = gsap.utils.toArray('.headline-letter');
  const statCards = gsap.utils.toArray('.stat-card');
  
  const hudSpeedVal = document.getElementById('hudSpeedVal');
  const hudRpmFill = document.getElementById('hudRpmFill');
  const hudJourneyFill = document.getElementById('hudJourneyFill');
  const hudProgressText = document.getElementById('hudProgressText');
  const navSpeed = document.getElementById('navSpeed');
  const navGForce = document.getElementById('navGForce');
  const navProgress = document.getElementById('navProgress');
  const gaugeFillArc = document.getElementById('gaugeFillArc');
  const fpsCounter = document.getElementById('fpsCounter');
  const audioToggleBtn = document.getElementById('audioToggle');

  let audioCtx = null;
  let osc1 = null, osc2 = null, turboOsc = null, subOsc = null;
  let masterGain = null;
  let isAudioEnabled = false;
  let currentDriveMode = 'eco';
  let speedMultiplier = 1.0;
  let currentProgress = 0;
  let rawScrollVelocity = 0;

  function initAudioEngine() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.connect(masterGain);

    osc1 = audioCtx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(70, audioCtx.currentTime);

    osc2 = audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(140, audioCtx.currentTime);

    turboOsc = audioCtx.createOscillator();
    turboOsc.type = 'sine';
    turboOsc.frequency.setValueAtTime(600, audioCtx.currentTime);

    subOsc = audioCtx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(35, audioCtx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    turboOsc.connect(filter);
    subOsc.connect(filter);

    osc1.start();
    osc2.start();
    turboOsc.start();
    subOsc.start();
  }

  function updateEngineAudio(speed) {
    if (!isAudioEnabled || !audioCtx || !masterGain) return;
    const spd = Math.max(0, speed || 0);
    const baseFreq = 65 + (spd * 0.75 * speedMultiplier);

    osc1.frequency.setTargetAtTime(baseFreq, audioCtx.currentTime, 0.04);
    osc2.frequency.setTargetAtTime(baseFreq * 2, audioCtx.currentTime, 0.04);
    turboOsc.frequency.setTargetAtTime(600 + (spd * 2.5), audioCtx.currentTime, 0.06);
    subOsc.frequency.setTargetAtTime(baseFreq * 0.5, audioCtx.currentTime, 0.04);

    const targetGain = 0.10 + Math.min(0.25, (spd / 320) * 0.25);
    masterGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.04);
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', async () => {
      try {
        initAudioEngine();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        isAudioEnabled = !isAudioEnabled;
        if (isAudioEnabled) {
          audioToggleBtn.classList.add('playing');
          masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
          masterGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
          audioToggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg> <span>SOUND ON</span>`;
        } else {
          audioToggleBtn.classList.remove('playing');
          masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
          masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
          audioToggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg> <span>SOUND OFF</span>`;
        }
      } catch (err) {
        console.error('Audio toggle error:', err);
      }
    });
  }

  let scene, camera, renderer, starGeometry, stars, starCount = 1200;
  const canvas = document.getElementById('webglCanvas');

  function initThreeJS() {
    if (!canvas || typeof THREE === 'undefined') return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2000;
      positions[i + 1] = (Math.random() - 0.5) * 2000;
      positions[i + 2] = (Math.random() - 0.5) * 2000;

      colors[i] = 0.85;
      colors[i + 1] = 0.95;
      colors[i + 2] = 1.0;
    }

    starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    window.addEventListener('resize', () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initThreeJS();

  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.8,
    infinite: false,
  });

  lenis.on('scroll', (e) => {
    rawScrollVelocity = Math.abs(e.velocity || 0);
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const introTl = gsap.timeline({
    defaults: { ease: 'power3.out', duration: 0.9 },
    onComplete: () => {
      measureTrackElements();
    }
  });

  gsap.set('.navbar', { y: -60, opacity: 0 });
  gsap.set('.hero-top-bar', { opacity: 0, y: -20 });
  gsap.set('.road-surface', { scaleX: 0.95, opacity: 0 });
  gsap.set('.headline-letter', { y: 25, opacity: 0 });
  gsap.set(carWrapper, { x: -120, opacity: 0 });
  gsap.set('.hero-bottom-hud', { y: 40, opacity: 0 });

  introTl
    .to('.navbar', { y: 0, opacity: 1, duration: 0.8 })
    .to('.hero-top-bar', { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
    .to('.road-surface', { scaleX: 1, opacity: 1, duration: 0.8 }, '-=0.4')
    .to(carWrapper, { x: 0, opacity: 1, duration: 0.9, ease: 'back.out(1.4)' }, '-=0.5')
    .to('.headline-letter', {
      y: 0,
      opacity: 0.25,
      stagger: 0.04,
      duration: 0.6
    }, '-=0.6')
    .to('.hero-bottom-hud', { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.2)' }, '-=0.4');

  let letterMetrics = [];
  let roadWidth = 0;
  let carWidth = 220;
  let endX = 0;

  function measureTrackElements() {
    if (!roadSurface) return;
    const roadRect = roadSurface.getBoundingClientRect();
    roadWidth = roadRect.width;
    carWidth = carWrapper.offsetWidth || 200;
    endX = roadWidth - carWidth;

    letterMetrics = letters.map((letter) => {
      const rect = letter.getBoundingClientRect();
      return {
        element: letter,
        relativeLeft: rect.left - roadRect.left,
        center: (rect.left - roadRect.left) + (rect.width / 2)
      };
    });
  }

  window.addEventListener('resize', () => {
    measureTrackElements();
    ScrollTrigger.refresh();
  });

  measureTrackElements();

  let hasFiredConfetti = false;

  const mainScrollTrigger = ScrollTrigger.create({
    trigger: heroSection,
    start: 'top top',
    end: 'bottom top',
    pin: '#stickyTrack',
    scrub: 1.1,
    anticipatePin: 1,
    onUpdate: (self) => {
      const progress = self.progress;
      currentProgress = progress;
      const currentX = progress * endX;

      gsap.set(carWrapper, { x: currentX });

      const trailWidth = currentX + (carWidth * 0.45);
      gsap.set(carTrail, { width: `${Math.max(0, trailWidth)}px` });

      const carFrontX = currentX + (carWidth * 0.85);

      letterMetrics.forEach((metric) => {
        if (carFrontX >= metric.relativeLeft) {
          if (!metric.element.classList.contains('lit')) {
            metric.element.classList.add('lit');
          }
        } else {
          if (metric.element.classList.contains('lit')) {
            metric.element.classList.remove('lit');
          }
        }
      });

      const percentVal = Math.round(progress * 100);
      hudJourneyFill.style.width = `${percentVal}%`;
      hudProgressText.textContent = `${percentVal}% COMPLETE`;
      navProgress.textContent = `${percentVal}%`;

      statCards.forEach((card) => {
        const start = parseFloat(card.dataset.scrollStart || 0);
        const end = parseFloat(card.dataset.scrollEnd || 1);

        if (progress >= start && progress <= end) {
          if (!card.classList.contains('show')) {
            card.classList.add('show');
            animateCardCounter(card);
          }
        } else if (progress < start - 0.05 || progress > end + 0.1) {
          card.classList.remove('show');
        }
      });

      if (progress >= 0.98 && !hasFiredConfetti) {
        hasFiredConfetti = true;
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#def54f', '#00f0ff', '#ff6b2b', '#b56cff']
          });
        }
      } else if (progress < 0.90) {
        hasFiredConfetti = false;
      }
    }
  });

  function animateCardCounter(card) {
    const numberEl = card.querySelector('.stat-number');
    if (!numberEl) return;
    const target = parseInt(numberEl.dataset.target, 10) || 0;

    gsap.fromTo(numberEl, 
      { innerText: 0 }, 
      {
        innerText: target,
        duration: 1.4,
        ease: 'power2.out',
        snap: { innerText: 1 },
        onUpdate: function() {
          numberEl.textContent = Math.floor(this.targets()[0].innerText);
        }
      }
    );
  }

  let currentVelocity = 0;
  let frameCount = 0;
  let lastTime = performance.now();

  const totalGaugeArcLength = 141.37;

  function mainRenderLoop() {
    const baseCircuitSpeed = currentProgress * 260 * speedMultiplier;
    const boostSpeed = Math.min(60, rawScrollVelocity * 30 * speedMultiplier);
    const targetSpeed = Math.min(320, baseCircuitSpeed + boostSpeed);

    currentVelocity += (targetSpeed - currentVelocity) * 0.12;

    const displaySpeed = Math.max(0, Math.round(currentVelocity));
    const paddedSpeed = String(displaySpeed).padStart(3, '0');

    if (hudSpeedVal) hudSpeedVal.textContent = paddedSpeed;
    if (navSpeed) navSpeed.innerHTML = `${displaySpeed} <small>KM/H</small>`;

    const gForce = (1.0 + (currentVelocity / 320) * 1.85).toFixed(2);
    if (navGForce) navGForce.innerHTML = `${gForce} <small>G</small>`;

    if (gaugeFillArc) {
      const speedRatio = Math.min(1, currentVelocity / 320);
      const arcOffset = totalGaugeArcLength * (1 - speedRatio);
      gaugeFillArc.style.strokeDashoffset = arcOffset;
    }

    const rpmPercent = Math.min(100, (currentVelocity / 320) * 100);
    if (hudRpmFill) hudRpmFill.style.width = `${rpmPercent}%`;

    if (currentVelocity > 140) {
      carWrapper.classList.add('high-speed');
    } else {
      carWrapper.classList.remove('high-speed');
    }

    updateEngineAudio(currentVelocity);

    if (stars) {
      const positions = stars.geometry.attributes.position.array;
      const speedFactor = 1.2 + (currentVelocity * 0.08);

      for (let i = 2; i < starCount * 3; i += 3) {
        positions[i] += speedFactor;
        if (positions[i] > 400) {
          positions[i] -= 1800;
        }
      }
      stars.geometry.attributes.position.needsUpdate = true;
      stars.rotation.z += 0.001 + (currentVelocity * 0.00005);
      renderer.render(scene, camera);
    }

    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastTime));
      if (fpsCounter) fpsCounter.textContent = `${fps} FPS`;
      frameCount = 0;
      lastTime = now;
    }

    rawScrollVelocity *= 0.92;

    requestAnimationFrame(mainRenderLoop);
  }

  requestAnimationFrame(mainRenderLoop);

  const cursor = document.getElementById('customCursor');
  const cursorDot = document.getElementById('cursorDot');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let cursorX = mouseX, cursorY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  function updateCursor() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    if (cursor) {
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
    }
    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  const hoverTargets = document.querySelectorAll('button, a, .stat-card, .theme-dot, .mode-btn');
  hoverTargets.forEach((target) => {
    target.addEventListener('mouseenter', () => cursor?.classList.add('hovered'));
    target.addEventListener('mouseleave', () => cursor?.classList.remove('hovered'));
  });

  statCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateX = -(y / rect.height) * 18;
      const rotateY = (x / rect.width) * 18;

      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        transformPerspective: 800,
        ease: 'power1.out',
        duration: 0.3
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        ease: 'power2.out',
        duration: 0.6
      });
    });
  });

  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentDriveMode = btn.dataset.mode;
      if (currentDriveMode === 'eco') {
        speedMultiplier = 1.0;
        lenis.options.wheelMultiplier = 1.0;
      } else if (currentDriveMode === 'sport') {
        speedMultiplier = 1.35;
        lenis.options.wheelMultiplier = 1.3;
      } else if (currentDriveMode === 'warp') {
        speedMultiplier = 1.8;
        lenis.options.wheelMultiplier = 1.6;
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      lenis.scrollTo(window.scrollY + 280, { duration: 0.8 });
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      lenis.scrollTo(Math.max(0, window.scrollY - 280), { duration: 0.8 });
    } else if (e.code === 'Space') {
      e.preventDefault();
      lenis.scrollTo(window.scrollY + 600, { duration: 0.9, easing: (t) => t * t });
    }
  });

  const themeDots = document.querySelectorAll('.theme-dot');
  themeDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      themeDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');

      const selectedTheme = dot.dataset.theme;
      document.body.className = selectedTheme;
    });
  });

  const replayBtn = document.getElementById('replayScrollBtn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      lenis.scrollTo(0, {
        duration: 1.6,
        easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      });
    });
  }

  gsap.utils.toArray('.metric-feature-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.12,
      ease: 'power3.out'
    });
  });
});

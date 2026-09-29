# ITZFIZZ — Ultra-Advanced Scroll-Driven Hypercar Experience

> **Awwwards / Production Tier Re-creation**: A scroll-driven hero section animation built with a cutting-edge creative web technology stack: **Three.js (WebGL)**, **GSAP 3 (ScrollTrigger)**, **Lenis (Inertia Momentum)**, **Web Audio API (FM Synthesizer)**, and **Canvas Confetti**.

---

## 🚀 Advanced Technology Stack Overview

| Technology / Library | Purpose & Implementation |
| :--- | :--- |
| **Three.js (WebGL r128)** | Renders a real-time **3D kinetic speed particle warp tunnel** in the background that dynamically accelerates, rotates, and streaks based on your scroll velocity. |
| **GSAP 3.12.5 + ScrollTrigger** | Pinning (`pin: '#stickyTrack'`), scrub timeline interpolation (`scrub: 1.1`), staggered intro timeline, and precise letter-contact geometry detection. |
| **Lenis 1.1.18** | Ultra-smooth fluid inertia scrolling that synchronizes with the GSAP ticker for 120 FPS high-refresh display performance. |
| **Web Audio API** | Pure procedural FM sound synthesis (Sawtooth primary roar, Triangle harmonic, Sine sub-bass, and Turbo spool whistle) that pitches and revs dynamically on acceleration. |
| **Canvas Confetti FX** | Fires high-density celebratory confetti bursts when crossing the finish line (100% circuit completion). |
| **Lucide Icons** | Crisp, lightweight SVG vector UI icons. |
| **Custom Magnetic Cursor** | Lerp-interpolated interactive cursor with dynamic hover snapping and blend mode effects. |

---

## 🌟 Comprehensive Feature Matrix

1. **Hero Section Layout (Requirement #1)**:
   - Full-screen pinned stage (above the fold) with letter-spaced headline `W E L C O M E   I T Z   F I Z Z`.
   - 4 High-contrast glassmorphic impact metric cards (`58%`, `23%`, `27%`, `40%`) positioned above and below the speedway.

2. **Initial Load Animation (Requirement #2)**:
   - Staggered GSAP timeline orchestrates the top navbar, road surface scale-in, staggered headline letter reveal (`stagger: 0.04s`), and HUD telemetry rise with elastic easing curves.

3. **Scroll-Driven Hypercar Animation (Requirement #3 - Core)**:
   - Supercar glides horizontally strictly tied to scroll progress.
   - Dynamic neon trail fills behind the vehicle.
   - Laser headlight beam illuminates each letter (`.lit` class with intense neon glow and vertical float) as the car front passes over it.
   - Metric cards scale into view with animated number count-up effects.

4. **Performance & Optimization (Requirement #4)**:
   - Hardware-accelerated GPU transforms (`translate3d`, `scale`, `will-change`).
   - Caching bounding-box calculations to guarantee zero layout reflows during scroll events.
   - Live FPS and real-time G-Force telemetry monitor.

5. **Interactive Controls & Extras**:
   - **Drive Mode Selector**: Switch between `ECO` (1.0x), `SPORT` (1.35x), and `WARP` (1.8x acceleration dynamics).
   - **Livery Themes**: 4 colorways (Toxic Lime, Electric Cyan, Solar Orange, Phantom Violet).
   - **Keyboard Driving**: Use `ArrowRight` / `ArrowDown` to drive forward, `ArrowLeft` / `ArrowUp` to reverse, and `Spacebar` for Turbo Boost!
   - **Sound Toggle**: Instant Web Audio engine sound activation.
   - **3D Perspective Tilt**: Metric cards respond with dynamic perspective on cursor hover.

---

## 🛠️ Project Structure

```text
assignment/
├── index.html        # Semantic, SEO-optimized HTML5 structure with Three.js canvas
├── style.css         # CSS design tokens, responsive typography, glassmorphism, radial gauge
├── script.js         # Three.js 3D warp, GSAP ScrollTrigger, Lenis engine, Web Audio synth
└── README.md         # Documentation & GitHub Pages deployment guide
```

---

## 🌐 Deploying to GitHub Pages (1-Minute Guide)

1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: Ultra-advanced scroll-driven hero section animation"
   ```

2. Link remote GitHub repo:
   ```bash
   git remote add origin https://github.com/<your-username>/car-scroll-hero.git
   git branch -M main
   git push -u origin main
   ```

3. Enable GitHub Pages in repository **Settings > Pages > Deploy from Branch (`main` / root)**.

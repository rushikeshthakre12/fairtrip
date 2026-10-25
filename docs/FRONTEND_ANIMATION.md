# FairTrip — Animated Frontend

## The background ("Night ride")
A Mumbai-style night street rendered live on a full-screen `<canvas>` behind the whole app:
parallax skyline with blinking windows, street lamps, black-and-yellow taxis with glowing
roof signs, a pickup → drop route arc, and a **fare-meter chip above every taxi** that ticks
up and turns green → amber → red (the same TYPICAL / ABOVE TYPICAL / UNUSUALLY HIGH idea
the app uses). The numbers in the chips are illustrative visuals, not real predictions.

* **Loop:** one seamless **20-second** cycle (`LOOP` in `src/background/scene.js`).
  The scene is a pure function of time, so frame 20.0 s == frame 0 s.
* **Resolution:** drawn in a virtual 1920×1080 space → crisp at Full HD, 4K and on phones.
  On 1080p screens the canvas is exactly 1920×1080.
* **Performance:** if frames run slow the canvas resolution steps down automatically
  (down to 50 %). Background tabs pause automatically.
* **Controls:** the ⏸ / ▶ button in the navbar pauses the animation (remembered in
  `localStorage`). `prefers-reduced-motion` users get a still frame automatically.
* **Preview:** open `/background` for a clean full-screen view (nice for screen recording).

## Other animations
| Where | What |
|---|---|
| Whole app | Frosted-glass cards over the moving scene, page fade-in, staggered entrance of each page's blocks |
| Landing | Staggered hero text, shimmering headline word, floating cards, pulsing CTA, city ticker, scroll-reveal sections, count-up stats (**live from the API**) |
| Checker | Full-screen "Analyzing…" overlay with a sweeping fare-meter needle |
| Result | Count-up prices, range bar grows in, quote marker drops in, status badge pops, factor bars grow |
| Navbar | Blur/shadow on scroll, animated link underline, mobile menu, motion toggle |

## Files
```
src/background/scene.js      the whole scene (pure function of time)
src/background/motion.js     pause/play preference
src/components/AnimatedBackground.jsx   canvas + loop + adaptive resolution
src/pages/BackgroundPreview.jsx         /background viewer (+ ?export=1 mode)
src/components/Reveal.jsx, CountUp.jsx, StatsStrip.jsx, AnalyzingOverlay.jsx
src/hooks/useInView.js, useCountUp.js
src/index.css                animation keyframes (search "Animated-UI layer")
scripts/export-background-video.mjs     renders the MP4
```

## Exporting the background as a Full HD video (MP4)
Requires `ffmpeg` on PATH and the `canvas` package (not part of `package.json` on purpose —
it is a native module and only needed for this export):

```bash
cd frontend
npm i --no-save canvas
node scripts/export-background-video.mjs fairtrip-background-1080p.mp4
```
Output: 1920×1080, 30 fps, 20 s, H.264, seamless loop (~7 MB).
For a longer video use `SECONDS=60` (multiples of 20 keep the loop seamless); for 60 fps use `FPS=60`.

## Tuning
* Slower/faster world: change `n` (laps per loop) in `TAXIS`, or the layer speeds in `drawScene`.
* Colours: the constants `GREEN`, `AMBER`, `RED` at the top of `scene.js`.
* Calmer UI: raise the opacity of `.bg-scrim` in `src/index.css`.

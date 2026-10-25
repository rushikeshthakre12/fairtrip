/**
 * Renders the FairTrip animated background to a Full HD MP4.
 *
 *   npm i --no-save canvas          (native module; also: ffmpeg must be on PATH)
 *   node scripts/export-background-video.mjs [output.mp4]
 *
 * Output: 1920x1080, 30 fps, 20 seconds, H.264, seamless loop
 * (the last frame flows straight back into the first one).
 * Optional env: FPS=60  SECONDS=40  (SECONDS should be a multiple of 20 to keep the loop seamless)
 */
import { createCanvas, registerFont } from 'canvas'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { once } from 'node:events'
import { drawScene, LOOP, W, H } from '../src/background/scene.js'

const FPS = Number(process.env.FPS || 30)
const SECONDS = Number(process.env.SECONDS || LOOP)
const OUT = process.argv[2] || 'fairtrip-background-1080p.mp4'
const FRAMES = Math.round(FPS * SECONDS)

// Same mono font as the website (bundled in scripts/fonts, SIL OFL licensed).
const here = path.dirname(fileURLToPath(import.meta.url))
for (const w of ['600', '700']) {
  try {
    registerFont(path.join(here, 'fonts', `IBMPlexMono-${w}.ttf`), { family: 'IBM Plex Mono', weight: w })
  } catch {
    console.log(`(font ${w} not found — falling back to the system monospace font)`)
  }
}

const canvas = createCanvas(W, H)
const ctx = canvas.getContext('2d')

const ff = spawn(
  'ffmpeg',
  ['-y', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-video_size', `${W}x${H}`, '-framerate', String(FPS), '-i', '-',
   '-vf', 'scale=flags=accurate_rnd+full_chroma_int:sws_dither=ed,format=yuv420p',
   '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-x264-params', 'aq-mode=3',
   '-movflags', '+faststart', OUT],
  { stdio: ['pipe', 'inherit', 'inherit'] },
)

const started = Date.now()
for (let i = 0; i < FRAMES; i++) {
  drawScene(ctx, i / FPS)
  const raw = canvas.toBuffer('raw') // BGRA, no JPEG artefacts
  if (!ff.stdin.write(raw)) await once(ff.stdin, 'drain')
  if (i % 60 === 0) console.log(`frame ${i}/${FRAMES}  (${((Date.now() - started) / 1000).toFixed(0)}s)`)
}
ff.stdin.end()
const [code] = await once(ff, 'close')
console.log(code === 0 ? `Done -> ${OUT}` : `ffmpeg exited with code ${code}`)

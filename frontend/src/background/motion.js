// Remembers whether the user paused the animated background.
export function readMotionPref() {
  try {
    return localStorage.getItem('ft-motion') !== 'off'
  } catch {
    return true
  }
}

export function writeMotionPref(on) {
  try {
    localStorage.setItem('ft-motion', on ? 'on' : 'off')
  } catch {
    /* storage unavailable — ignore */
  }
  window.dispatchEvent(new Event('ft-motion-change'))
}

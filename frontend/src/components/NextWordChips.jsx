import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { getNextWords } from '../services/api'

/**
 * Shows the 3 most likely next words from the CBOW model as you type.
 * Clicking a chip appends the word. If the model is unavailable, nothing shows.
 */
export default function NextWordChips({ text, onPick }) {
  const [words, setWords] = useState([])

  useEffect(() => {
    if (!text || !text.trim()) {
      setWords([])
      return undefined
    }
    let alive = true
    const timer = setTimeout(() => {
      getNextWords(text)
        .then((r) => alive && setWords(r.suggestions || []))
        .catch(() => alive && setWords([]))
    }, 250)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [text])

  if (!words.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="flex items-center gap-1 text-slate">
        <Sparkles size={12} className="text-signal" /> Next word (CBOW):
      </span>
      {words.map((w) => (
        <button
          key={w}
          type="button"
          onClick={() => onPick(w)}
          className="rounded-full border border-signal/30 bg-signal/10 px-3 py-1 font-medium text-signal transition-colors hover:bg-signal/20"
        >
          {w}
        </button>
      ))}
    </div>
  )
}

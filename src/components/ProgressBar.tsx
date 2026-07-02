import { useEffect, useState } from 'react'
import { c } from '../theme'

/** Barra 6px pill; anima su ancho al entrar (300ms ease-out, vía global.css). */
export default function ProgressBar({
  pct,
  color,
  track = c.emptyBar,
  height = 6,
}: {
  pct: number // 0..1
  color: string
  track?: string
  height?: number
}) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])
  return (
    <div style={{ height, background: track, borderRadius: 999 }}>
      <div
        className="bar-fill"
        style={{ height, width: `${Math.min(w, 1) * 100}%`, background: color, borderRadius: 999 }}
      />
    </div>
  )
}

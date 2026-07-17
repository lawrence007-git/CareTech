"use client"

import * as React from "react"

/**
 * Animates a number from 0 up to `target` using a smooth ease-out curve.
 * Re-runs whenever `target` changes so live/derived stats animate in place.
 */
export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = React.useState(0)
  const startRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    startRef.current = null
    let frame: number

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}

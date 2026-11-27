import { useRef } from 'react'
import type { TouchEvent } from 'react'

export function useSwipe(next: () => void, previous: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null)
  return {
    onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) {
        start.current = null
        return
      }
      start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    },
    onTouchEnd(e: TouchEvent) {
      if (!start.current || !e.changedTouches.length) return
      const dx = e.changedTouches[0].clientX - start.current.x
      const dy = e.changedTouches[0].clientY - start.current.y
      start.current = null
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        if (dx < 0) next()
        else previous()
      }
    },
    onTouchCancel() {
      start.current = null
    },
  }
}

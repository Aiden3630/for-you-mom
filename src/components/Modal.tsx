import { useEffect, useRef } from 'react'
import type { ReactNode, KeyboardEventHandler } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  title,
  children,
  onClose,
  className = '',
  onKeyDown,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  className?: string
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement>
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = dialog.current
    const previous = document.activeElement as HTMLElement | null
    el?.showModal()
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      el?.close()
      document.body.style.overflow = oldOverflow
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      className={`modal ${className}`}
      aria-label={title}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (e.key !== 'Tab') return
        const items = Array.from(
          e.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input, [tabindex="0"]',
          ),
        ).filter((el) => el.getClientRects().length > 0)
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-inner">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Закрыть">
          <X size={21} />
        </button>
        {children}
      </div>
    </dialog>
  )
}

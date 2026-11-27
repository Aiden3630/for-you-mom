import { useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { Sprig } from '../components/Botanical'
import { giftConfig, personalize } from '../config/gift.config'

export default function Intro({ next, hasNext = true }: { next: () => void; hasNext?: boolean }) {
  const [opening, setOpening] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const reduced = useReducedMotion()
  useEffect(() => () => clearTimeout(timer.current), [])
  function open() {
    if (opening) {
      if (!hasNext) setOpening(false)
      return
    }
    setOpening(true)
    if (hasNext) timer.current = setTimeout(next, reduced ? 0 : 1750)
  }
  const title = personalize(giftConfig.intro.title)
  const comma = title.lastIndexOf(',')
  return (
    <section className="intro chapter" aria-labelledby="chapter-heading">
      <div className="intro-copy">
        <p className="eyebrow">
          <span />
          {giftConfig.intro.eyebrow}
        </p>
        <h1 id="chapter-heading" tabIndex={-1}>
          {comma > 0 ? (
            <>
              {title.slice(0, comma + 1)}
              <br />
              <em>{title.slice(comma + 1).trim()}</em>
            </>
          ) : (
            title
          )}
        </h1>
        <p className="intro-text">{personalize(giftConfig.intro.text)}</p>
        <button className="primary-button" onClick={open} disabled={opening && hasNext}>
          <Heart size={17} strokeWidth={1.5} />
          {opening ? (hasNext ? 'Письмо открывается…' : 'Закрыть конверт') : 'Открыть письмо'}
        </button>
        <p className="quiet-note">Немного времени. Много любви.</p>
      </div>
      <div
        className={`envelope-scene ${opening ? 'is-opening' : ''}`}
        onPointerMove={(e) => {
          if (reduced || e.pointerType !== 'mouse') return
          const rect = e.currentTarget.getBoundingClientRect()
          e.currentTarget.style.setProperty(
            '--drift-x',
            `${(e.clientX - rect.left - rect.width / 2) * 0.018}px`,
          )
          e.currentTarget.style.setProperty(
            '--drift-y',
            `${(e.clientY - rect.top - rect.height / 2) * 0.018}px`,
          )
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.setProperty('--drift-x', '0px')
          e.currentTarget.style.setProperty('--drift-y', '0px')
        }}
      >
        <div className="envelope-halo" />
        <Sprig className="envelope-sprig sprig-left" />
        <Sprig className="envelope-sprig sprig-right" flip />
        <div className="envelope-shadow" />
        <div className="envelope" aria-hidden="true">
          <div className="envelope-back" />
          <div className="letter-peek">
            <span>Мам,</span>
            <i />
            <i />
            <Heart size={23} strokeWidth={1} />
          </div>
          <div className="envelope-flap" />
          <div className="envelope-front">
            <span>{giftConfig.intro.envelopeLabel}</span>
            <b>{personalize('Для тебя, {mom}')}</b>
          </div>
          <div className="wax-seal">
            <Heart size={25} strokeWidth={1.2} />
          </div>
        </div>
        <span className="scene-handwriting">только для тебя</span>
        <div className="little-spark spark-one">✧</div>
        <div className="little-spark spark-two">✧</div>
      </div>
    </section>
  )
}

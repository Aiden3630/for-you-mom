import { useState } from 'react'
import { Heart, Check, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { giftConfig, personalize } from '../config/gift.config'
import { FlowerHead } from '../components/Botanical'

export default function Thanks({
  opened,
  setOpened,
}: {
  opened: number[]
  setOpened: (value: number[]) => void
}) {
  const [active, setActive] = useState<number | null>(null)
  function open(i: number) {
    setActive(i)
    if (!opened.includes(i)) setOpened([...opened, i])
  }
  return (
    <section className="thanks-chapter chapter" aria-labelledby="chapter-heading">
      <div className="chapter-heading">
        <p className="eyebrow">Так много поводов сказать</p>
        <h1 id="chapter-heading" tabIndex={-1}>
          Спасибо <em>тебе</em>
        </h1>
        <p className="chapter-description">В каждом маленьком письме – большая благодарность.</p>
      </div>
      <div className="gratitude-letters">
        {giftConfig.thanks.map((item, i) => (
          <button
            key={item.title}
            className={`mini-envelope ${opened.includes(i) ? 'opened' : ''}`}
            onClick={() => open(i)}
            aria-label={`${opened.includes(i) ? 'Прочитать снова' : 'Открыть благодарность'} ${i + 1}: ${item.title}`}
            aria-pressed={active === i}
          >
            <span className="mini-flap" aria-hidden="true" />
            <span className="mini-heart" aria-hidden="true">
              {opened.includes(i) ? (
                <Check size={19} strokeWidth={1.4} />
              ) : (
                <Heart size={18} strokeWidth={1.2} />
              )}
            </span>
            <span className="mini-number">{String(i + 1).padStart(2, '0')}</span>
            {opened.includes(i) && (
              <svg className="mini-bloom" viewBox="-60 -60 120 120" aria-hidden="true">
                <FlowerHead scale={0.9} tone={i % 2 ? 'cream' : 'pink'} />
              </svg>
            )}
          </button>
        ))}
      </div>
      <div className="thank-message" aria-live="polite">
        <AnimatePresence mode="wait">
          {active !== null ? (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <button
                className="icon-button thank-close"
                onClick={() => setActive(null)}
                aria-label="Свернуть благодарность"
              >
                <X size={16} />
              </button>
              <h2>{personalize(giftConfig.thanks[active].title)}</h2>
              <p>{personalize(giftConfig.thanks[active].text)}</p>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="thank-hint"
            >
              Коснись любого письма. Оно для тебя.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <p className="quiet-note">
        Открыто {opened.length} из {giftConfig.thanks.length} · можно продолжить в любой момент
      </p>
    </section>
  )
}

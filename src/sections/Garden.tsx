import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { giftConfig, personalize } from '../config/gift.config'
import { FlowerHead } from '../components/Botanical'

export default function Garden({
  bloomed,
  setBloomed,
}: {
  bloomed: number[]
  setBloomed: (value: number[]) => void
}) {
  const [active, setActive] = useState<number | null>(null)
  const count = giftConfig.wishes.length
  function bloom(i: number) {
    if (!bloomed.includes(i)) setBloomed([...bloomed, i])
    setActive(i)
  }
  return (
    <section
      className={`garden-chapter chapter ${bloomed.length === count ? 'garden-complete' : ''} ${count > 9 ? 'garden-many' : ''}`}
      aria-labelledby="chapter-heading"
    >
      <div className="chapter-heading">
        <p className="eyebrow">Пусть всё хорошее растёт</p>
        <h1 id="chapter-heading" tabIndex={-1}>
          Сад <em>для мамы</em>
        </h1>
        <p className="chapter-description">Коснись бутона — и для тебя распустится пожелание.</p>
      </div>
      <div className="garden-scene">
        <div className="garden-sun" aria-hidden="true" />
        <svg
          className="garden-grasses"
          viewBox="0 0 1000 360"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 350 Q140 300 290 335 T600 325 T1000 345" fill="#dce2d1" opacity=".5" />
          {Array.from({ length: 40 }, (_, i) => (
            <path
              key={i}
              d={`M${i * 26} 360 Q${i * 26 + 25} ${280 - (i % 3) * 25} ${i * 26 - 15} ${220 + (i % 5) * 18}`}
              stroke={i % 2 ? '#a8b5a2' : '#b8c3a5'}
              strokeWidth="1.5"
              fill="none"
              opacity=".7"
            />
          ))}
        </svg>
        <div className="garden-flowers">
          {giftConfig.wishes.map((w, i) => (
            <button
              key={w.title}
              className={`garden-flower ${bloomed.includes(i) ? 'is-bloomed' : ''}`}
              style={
                {
                  '--stem-height': `${130 + (i % 3) * 35}px`,
                  '--sway-delay': `${-i * 0.7}s`,
                } as React.CSSProperties
              }
              onClick={() => bloom(i)}
              aria-label={`${bloomed.includes(i) ? 'Пожелание' : 'Распустить цветок'}: ${w.title}`}
              aria-pressed={bloomed.includes(i)}
            >
              <svg
                className="garden-flower-art"
                viewBox={`0 0 140 ${300 + (i % 3) * 70}`}
                preserveAspectRatio="xMidYMax meet"
                aria-hidden="true"
              >
                <path
                  d={`M70 ${290 + (i % 3) * 70} Q85 182 70 65`}
                  stroke="#829274"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M76 217 Q16 218 25 171 Q62 169 76 217 M75 162 Q122 164 122 127 Q86 126 75 162"
                  fill="#a8b5a2"
                />
                <FlowerHead
                  x={70}
                  y={65}
                  scale={1.03}
                  tone={i % 3 === 0 ? 'cream' : i % 3 === 1 ? 'pink' : 'rose'}
                  open={bloomed.includes(i)}
                />
              </svg>
              <span className="flower-number">{String(i + 1).padStart(2, '0')}</span>
              {bloomed.includes(i) && (
                <span className="bloom-sparkles" aria-hidden="true">
                  ✧ · ✦
                </span>
              )}
            </button>
          ))}
        </div>
        <svg className="butterfly" viewBox="0 0 60 50" aria-hidden="true">
          <path
            d="M29 31 C0 18 5 0 21 9 Q34 15 29 31 M31 31 C60 18 56 0 39 9 Q27 15 31 31"
            fill="#dab4ad"
          />
          <path d="M29 30 C9 25 12 46 25 40 M31 30 C52 25 49 46 35 40" fill="#e5c9b5" />
          <path d="M30 19v21m0-18-5-6m5 6 5-6" stroke="#947b64" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="wish-message" aria-live="polite">
        {active !== null ? (
          <motion.div key={active} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}>
            <h2>{personalize(giftConfig.wishes[active].title)}</h2>
            <p>{personalize(giftConfig.wishes[active].text)}</p>
          </motion.div>
        ) : (
          <p className="garden-hint">Каждый цветок — моё пожелание тебе.</p>
        )}
      </div>
      <button
        className="secondary-button"
        onClick={() => {
          setBloomed(giftConfig.wishes.map((_, i) => i))
          setActive(count ? count - 1 : null)
        }}
        disabled={bloomed.length === count}
      >
        <Sparkles size={17} />
        {bloomed.length === count ? 'Весь сад цветёт для тебя' : 'Расцветить весь сад'}
      </button>
      <p className="quiet-note">
        Распустилось {bloomed.length} из {count}
      </p>
    </section>
  )
}

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Heart } from 'lucide-react'
import { giftConfig, personalize } from '../config/gift.config'
import { Sprig } from '../components/Botanical'

export default function Letter() {
  const reduced = useReducedMotion()
  const [all, setAll] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAll(true), giftConfig.letter.paragraphs.length * 650 + 800)
    return () => clearTimeout(t)
  }, [])
  return (
    <section className="letter-chapter chapter" aria-labelledby="chapter-heading">
      <div className="chapter-heading">
        <p className="eyebrow">То, что давно хотелось сказать</p>
        <h1 id="chapter-heading" tabIndex={-1}>
          Письмо <em>маме</em>
        </h1>
      </div>
      <article className="letter-paper">
        <div className="letter-topline">
          <span>Личное. Самое важное.</span>
          <Heart size={17} />
        </div>
        <h2 className="handwritten">{personalize(giftConfig.letter.greeting)}</h2>
        {!all && !reduced && (
          <button className="text-button reveal-letter" onClick={() => setAll(true)}>
            Показать всё письмо
          </button>
        )}
        <div className="letter-body">
          {giftConfig.letter.paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: all ? 0.12 : 0.6, delay: all || reduced ? 0 : i * 0.65 }}
            >
              {personalize(p)}
            </motion.p>
          ))}
        </div>
        <p className="letter-closing">{personalize(giftConfig.letter.closing)}</p>
        <p className="handwritten signature">
          {giftConfig.sonName}
          <Heart size={18} strokeWidth={1} />
        </p>
        <Sprig className="letter-sprig" />
      </article>
    </section>
  )
}

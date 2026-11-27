import { useState } from 'react'
import { Download, Heart, RotateCcw } from 'lucide-react'
import { giftConfig, personalize } from '../config/gift.config'
import { Sprig } from '../components/Botanical'

export default function Final({
  restart,
  save,
}: {
  restart: () => void
  save: (kind: 'bouquet' | 'final') => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  return (
    <section className="final-chapter chapter" aria-labelledby="chapter-heading">
      <Sprig className="final-sprig final-left" />
      <Sprig className="final-sprig final-right" flip />
      <div className="final-heart" aria-hidden="true">
        <Heart size={73} strokeWidth={0.65} />
        <span>мам</span>
      </div>
      <p className="eyebrow">Ты — моё самое тёплое место в мире</p>
      <h1 id="chapter-heading" tabIndex={-1}>
        {personalize(giftConfig.final.title)}
      </h1>
      <p className="final-text">{personalize(giftConfig.final.text)}</p>
      <p className="love-handwriting">{personalize(giftConfig.final.love)}</p>
      <p className="final-signature">{personalize(giftConfig.final.signature)}</p>
      <div className="final-actions">
        <button
          className="primary-button"
          disabled={saving}
          onClick={() => {
            setSaving(true)
            void save('final').finally(() => setSaving(false))
          }}
        >
          <Download size={17} />
          {saving ? 'Создаю открытку…' : 'Сохранить открытку'}
        </button>
        <button className="text-button" onClick={restart}>
          <RotateCcw size={16} />
          Посмотреть ещё раз
        </button>
      </div>
    </section>
  )
}

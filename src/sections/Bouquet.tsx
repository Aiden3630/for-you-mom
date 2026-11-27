import { useState } from 'react'
import { Download } from 'lucide-react'
import { BouquetArt } from '../components/Botanical'

export default function Bouquet({ save }: { save: (kind: 'bouquet' | 'final') => Promise<void> }) {
  const [saving, setSaving] = useState(false)
  return (
    <section className="bouquet-chapter chapter" aria-labelledby="chapter-heading">
      <div className="bouquet-copy">
        <p className="eyebrow">Собран с любовью. Навсегда.</p>
        <h1 id="chapter-heading" tabIndex={-1}>
          Букет, который
          <br />
          <em>не завянет</em>
        </h1>
        <p className="chapter-description bouquet-quote">
          Эти цветы никогда не завянут.
          <br />
          Как и моя благодарность тебе.
        </p>
        <button
          className="primary-button"
          disabled={saving}
          onClick={() => {
            setSaving(true)
            void save('bouquet').finally(() => setSaving(false))
          }}
        >
          <Download size={17} />
          {saving ? 'Создаю открытку…' : 'Сохранить букет'}
        </button>
        <p className="quiet-note">Открытка, которую можно оставить себе</p>
      </div>
      <div className="bouquet-scene">
        <div className="bouquet-halo" />
        <BouquetArt className="large-bouquet" animated />
        <span className="bouquet-handwriting">каждый цветок – спасибо</span>
      </div>
    </section>
  )
}

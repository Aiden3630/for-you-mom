import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react'
import { BookOpen, ChevronLeft, ChevronRight, Heart, List, Download } from 'lucide-react'
import { giftConfig, personalize } from './config/gift.config'
import type { ChapterId } from './config/gift.config'
import Intro from './sections/Intro'
import MusicControl from './components/MusicControl'
import Modal from './components/Modal'
import { Ambient, BouquetArt } from './components/Botanical'

const Letter = lazy(() => import('./sections/Letter'))
const Memories = lazy(() => import('./sections/Memories'))
const Thanks = lazy(() => import('./sections/Thanks'))
const Garden = lazy(() => import('./sections/Garden'))
const Bouquet = lazy(() => import('./sections/Bouquet'))
const Final = lazy(() => import('./sections/Final'))
const enabled = giftConfig.chapters.filter((c) => c.enabled)
const chapters = enabled.length
  ? enabled
  : [{ id: 'intro' as const, label: 'Для тебя', enabled: true }]
function initialChapter(): ChapterId {
  return chapters.find((c) => c.id === window.location.hash.slice(1))?.id ?? chapters[0].id
}

export default function App() {
  const [current, setCurrent] = useState<ChapterId>(initialChapter)
  const [menu, setMenu] = useState(false)
  const [secret, setSecret] = useState(false)
  const [opened, setOpened] = useState<number[]>([])
  const [bloomed, setBloomed] = useState<number[]>([])
  const [notice, setNotice] = useState('')
  const [exportUrl, setExportUrl] = useState('')
  const reduced = useReducedMotion()
  const first = useRef(true)
  const exportRef = useRef<HTMLDivElement>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const index = chapters.findIndex((c) => c.id === current)

  const go = useCallback((id: ChapterId) => {
    if (!chapters.some((c) => c.id === id)) return
    setCurrent(id)
    setMenu(false)
    window.history.replaceState(null, '', `#${id}`)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])
  const next = useCallback(
    () => go(chapters[Math.min(index + 1, chapters.length - 1)].id),
    [go, index],
  )
  useEffect(() => {
    document.title = giftConfig.siteTitle
    Object.entries(giftConfig.palette).forEach(([name, value]) =>
      document.documentElement.style.setProperty(`--${name}`, value),
    )
    const hash = () => go(initialChapter())
    window.addEventListener('hashchange', hash)
    return () => {
      window.removeEventListener('hashchange', hash)
      clearTimeout(noticeTimer.current)
    }
  }, [go])
  useEffect(
    () => () => {
      if (exportUrl) URL.revokeObjectURL(exportUrl)
    },
    [exportUrl],
  )

  async function save(kind: 'bouquet' | 'final') {
    try {
      const { createPostcard } = await import('./utils/postcard')
      const svg = exportRef.current?.querySelector('svg')
      if (!svg) throw new Error('Букет ещё загружается')
      const blob = await createPostcard(svg, kind)
      const url = URL.createObjectURL(blob)
      setExportUrl(url)
      const link = document.createElement('a')
      link.href = url
      link.download = kind === 'bouquet' ? 'buket-dlya-mamy.png' : 's-dnem-materi.png'
      link.click()
      setNotice('Открытка готова. Если загрузка не началась, открой её ниже.')
    } catch {
      setNotice('Не удалось сохранить открытку. Попробуй ещё раз.')
    }
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 15000)
  }

  const date = new Date(`${giftConfig.holidayDate}T12:00:00Z`)
  const displayDate = Number.isNaN(date.getTime())
    ? giftConfig.holidayDate
    : new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
        date,
      )
  return (
    <MotionConfig reducedMotion="user">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        К содержимому
      </a>
      <div className={`gift-app chapter-${current}`}>
        <Ambient garden={current === 'garden' || current === 'final'} />
        <header className="site-header">
          <button
            className="brand"
            onClick={() => go(chapters[0].id)}
            aria-label="В начало подарка"
          >
            <span className="brand-mark">
              <Heart size={22} strokeWidth={1} />
            </span>
            <span>{giftConfig.siteTitle}</span>
          </button>
          <span className="holiday-label">
            День матери<span>·</span>
            {displayDate}
          </span>
          <div className="header-actions">
            <MusicControl />
            <button
              className="icon-button contents-button"
              onClick={(e) => {
                e.currentTarget.focus({ preventScroll: true })
                setMenu(true)
              }}
              aria-label="Оглавление"
              aria-haspopup="dialog"
            >
              <List size={21} strokeWidth={1.3} />
            </button>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className="chapter-container"
              key={current}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -10 }}
              transition={{ duration: reduced ? 0 : 0.38 }}
              onAnimationComplete={() => {
                if (first.current) first.current = false
                else document.getElementById('chapter-heading')?.focus({ preventScroll: true })
              }}
            >
              <Suspense
                fallback={
                  <div className="chapter-loading" role="status">
                    <Heart size={24} strokeWidth={1} />
                    <span>Ещё одна тёплая страница…</span>
                  </div>
                }
              >
                {current === 'intro' && <Intro next={next} hasNext={index < chapters.length - 1} />}
                {current === 'letter' && <Letter />}
                {current === 'memories' && <Memories />}
                {current === 'thanks' && <Thanks opened={opened} setOpened={setOpened} />}
                {current === 'garden' && <Garden bloomed={bloomed} setBloomed={setBloomed} />}
                {current === 'bouquet' && <Bouquet save={save} />}
                {current === 'final' && (
                  <Final
                    save={save}
                    restart={() => {
                      setOpened([])
                      setBloomed([])
                      go(chapters[0].id)
                    }}
                  />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="site-footer">
          <div className="journey-bar">
            <div className="chapter-counter">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <i />
              {String(chapters.length).padStart(2, '0')}
            </div>
            <span className="journey-caption">
              <span className="journey-desktop">История о самом дорогом</span>
              <span className="journey-mobile">{chapters[index].label}</span>
            </span>
            <div className="journey-actions">
              {index > 0 && (
                <button className="text-button" onClick={() => go(chapters[index - 1].id)}>
                  <ChevronLeft size={16} />
                  Назад
                </button>
              )}
              {current !== 'intro' && index < chapters.length - 1 && (
                <button className="text-button continue-button" onClick={next}>
                  Дальше
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
          <nav
            className="chapter-nav"
            aria-label="Главы подарка"
            style={{ gridTemplateColumns: `repeat(${chapters.length}, minmax(0, 1fr))` }}
          >
            {chapters.map((c, i) => (
              <button
                key={c.id}
                onClick={() => go(c.id)}
                aria-label={`Глава ${i + 1}: ${c.label}`}
                aria-current={current === c.id ? 'step' : undefined}
              >
                <span className="nav-dot" data-number={String(i + 1).padStart(2, '0')}>
                  {i < index ? <Heart size={8} fill="currentColor" /> : <i />}
                </span>
                <span>{c.label}</span>
              </button>
            ))}
          </nav>
          <div className="footer-note">
            <span>С любовью, {giftConfig.sonName}</span>
            <button
              className="secret-button icon-button"
              aria-label="Маленький секрет"
              onClick={(e) => {
                e.currentTarget.focus({ preventScroll: true })
                setSecret(true)
              }}
            >
              <Heart size={15} strokeWidth={1} />
            </button>
            <span>Для самой дорогой</span>
          </div>
        </footer>
        <div className="export-art" ref={exportRef} aria-hidden="true">
          <BouquetArt />
        </div>
        {notice && (
          <div className="toast" role="status">
            <p>{notice}</p>
            {exportUrl && (
              <a
                href={exportUrl}
                download="otkrytka-dlya-mamy.png"
                target="_blank"
                rel="noreferrer"
              >
                <Download size={15} />
                Открыть PNG-открытку
              </a>
            )}
            <button className="text-button" onClick={() => setNotice('')}>
              Закрыть
            </button>
          </div>
        )}
        {menu && (
          <Modal title="Оглавление подарка" onClose={() => setMenu(false)}>
            <BookOpen className="modal-emblem" size={29} strokeWidth={1} />
            <p className="eyebrow">Каждая страница – для тебя</p>
            <h2>
              Наша маленькая <em>история</em>
            </h2>
            <nav className="contents-list" aria-label="Выбор главы">
              {chapters.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => go(c.id)}
                  aria-current={c.id === current ? 'step' : undefined}
                >
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {c.label}
                  <Heart size={14} strokeWidth={1} />
                </button>
              ))}
            </nav>
          </Modal>
        )}
        {secret && (
          <Modal title="Маленький секрет" onClose={() => setSecret(false)}>
            <Heart className="modal-emblem" size={34} strokeWidth={1} />
            <p className="eyebrow">Кое-что ещё, мам</p>
            <p className="secret-message">{personalize(giftConfig.secret)}</p>
            <p className="handwritten">Всегда {giftConfig.sonName}</p>
          </Modal>
        )}
      </div>
    </MotionConfig>
  )
}

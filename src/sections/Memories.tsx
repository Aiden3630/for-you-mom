import { useState } from 'react'
import { Camera, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { giftConfig, publicAsset } from '../config/gift.config'
import type { GiftPhoto } from '../config/gift.config'
import Modal from '../components/Modal'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useSwipe } from '../hooks/useSwipe'

function Photo({ photo, large = false }: { photo: GiftPhoto; large?: boolean }) {
  const [failed, setFailed] = useState(false)
  return failed || !publicAsset(photo.src) ? (
    <div className="photo-missing">
      <ImageOff size={26} />
      <span>Снимок пока недоступен</span>
    </div>
  ) : (
    <img
      src={publicAsset(photo.src)}
      alt={photo.alt}
      loading={large ? 'eager' : 'lazy'}
      width={photo.width}
      height={photo.height}
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

export default function Memories() {
  const [firstPhoto, setFirstPhoto] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const single = useMediaQuery('(max-width: 600px)')
  const perPage = single ? 1 : 2
  const photos = giftConfig.photos.filter((p) => p.src.trim())
  const pageCount = Math.ceil(photos.length / perPage)
  const page = Math.min(Math.floor(firstPhoto / perPage), Math.max(0, pageCount - 1))
  function turn(delta: number) {
    setFirstPhoto(Math.max(0, Math.min(pageCount - 1, page + delta)) * perPage)
  }
  function changePhoto(delta: number) {
    setSelected((i) =>
      i === null || !photos.length ? null : (i + delta + photos.length) % photos.length,
    )
  }
  const albumSwipe = useSwipe(
    () => turn(1),
    () => turn(-1),
  )
  const photoSwipe = useSwipe(
    () => changePhoto(1),
    () => changePhoto(-1),
  )
  const photo = selected === null ? null : photos[selected]
  return (
    <section className="memories-chapter chapter" aria-labelledby="chapter-heading">
      <div className="chapter-heading">
        <p className="eyebrow">Самое дорогое — между нами</p>
        <h1 id="chapter-heading" tabIndex={-1}>
          Наши <em>воспоминания</em>
        </h1>
        <p className="chapter-description">Моменты, которые хочется беречь.</p>
      </div>
      <div className="album" {...albumSwipe}>
        <div className="album-binding" aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.div
            key={`${perPage}-${page}`}
            className="album-spread"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {photos.length
              ? photos.slice(page * perPage, page * perPage + perPage).map((p, i) => (
                  <button
                    className="polaroid"
                    key={p.src + i}
                    onClick={(e) => {
                      e.currentTarget.focus({ preventScroll: true })
                      setSelected(page * perPage + i)
                    }}
                    aria-label={`Увеличить фото: ${p.caption}`}
                  >
                    <div
                      className="photo-window"
                      style={
                        single && p.width && p.height
                          ? { aspectRatio: `${p.width} / ${p.height}` }
                          : undefined
                      }
                    >
                      <Photo photo={p} />
                    </div>
                    <span className="photo-caption">{p.caption}</span>
                    {p.date && <time>{p.date}</time>}
                  </button>
                ))
              : [0, 1].map((i) => (
                  <div className="polaroid empty-polaroid" key={i}>
                    <div className="photo-window">
                      <Camera size={29} strokeWidth={1} />
                      <span>{i ? 'Для наших улыбок' : 'Для дорогих моментов'}</span>
                    </div>
                    <span className="photo-caption">Здесь будет наше фото</span>
                    <span className="empty-photo-note">Самое ценное — впереди</span>
                  </div>
                ))}
          </motion.div>
        </AnimatePresence>
      </div>
      {pageCount > 1 ? (
        <div className="album-pagination">
          <button
            className="icon-button"
            aria-label="Предыдущая страница альбома"
            onClick={() => turn(-1)}
            disabled={page === 0}
          >
            <ChevronLeft size={21} />
          </button>
          <span aria-live="polite">
            {page + 1} / {pageCount}
          </span>
          <button
            className="icon-button"
            aria-label="Следующая страница альбома"
            onClick={() => turn(1)}
            disabled={page === pageCount - 1}
          >
            <ChevronRight size={21} />
          </button>
        </div>
      ) : (
        <p className="album-note">
          {photos.length
            ? 'Коснись фотографии, чтобы рассмотреть её поближе.'
            : 'В этом альбоме есть место для наших настоящих фотографий.'}
        </p>
      )}
      {photos.length > 0 && pageCount > 1 && (
        <p className="album-swipe-note">
          Листай свайпом или кнопками · коснись фото, чтобы увеличить
        </p>
      )}
      {photo && (
        <Modal
          title={photo.caption}
          onClose={() => setSelected(null)}
          className="photo-modal"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault()
              changePhoto(-1)
            }
            if (e.key === 'ArrowRight') {
              e.preventDefault()
              changePhoto(1)
            }
          }}
        >
          <figure {...photoSwipe}>
            <Photo key={photo.src} photo={photo} large />
            <figcaption>
              {photo.caption}
              {photo.date && <small>{photo.date}</small>}
            </figcaption>
          </figure>
          {photos.length > 1 && (
            <div className="album-pagination">
              <button
                className="icon-button"
                aria-label="Предыдущее фото"
                onClick={() => changePhoto(-1)}
              >
                <ChevronLeft />
              </button>
              <span className="photo-position" aria-live="polite">
                {selected! + 1} / {photos.length}
              </span>
              <button
                className="icon-button"
                aria-label="Следующее фото"
                onClick={() => changePhoto(1)}
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </Modal>
      )}
    </section>
  )
}

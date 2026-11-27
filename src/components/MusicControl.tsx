import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Music2 } from 'lucide-react'
import { giftConfig, publicAsset } from '../config/gift.config'
import { useStoredState } from '../hooks/useStoredState'

function smoothVolume(
  el: HTMLAudioElement,
  target: number,
  frame: { current: number },
  pause = false,
) {
  cancelAnimationFrame(frame.current)
  const start = el.volume
  const time = performance.now()
  function tick(now: number) {
    const progress = Math.min((now - time) / 650, 1)
    el.volume = Math.max(0, Math.min(1, start + (target - start) * progress))
    if (progress < 1) frame.current = requestAnimationFrame(tick)
    else if (pause) el.pause()
  }
  frame.current = requestAnimationFrame(tick)
}

export default function MusicControl() {
  const [enabled, setEnabled] = useStoredState('mom-gift-music', false)
  const [volume, setVolume] = useStoredState('mom-gift-volume', giftConfig.music.defaultVolume)
  const [playing, setPlaying] = useState(false)
  const [panel, setPanel] = useState(false)
  const [error, setError] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)
  const fade = useRef(0)
  const preference = useRef(enabled)
  const level = useRef(volume)

  useEffect(() => {
    preference.current = enabled
    level.current = volume
  }, [enabled, volume])
  useEffect(() => {
    if (!giftConfig.music.src) return
    const fadeFrame = fade
    const el = new Audio(publicAsset(giftConfig.music.src))
    el.loop = true
    el.preload = 'none'
    el.volume = 0
    audio.current = el
    const fail = () => {
      setError(true)
      setPlaying(false)
    }
    const pauseHidden = () => {
      if (document.hidden) {
        cancelAnimationFrame(fadeFrame.current)
        el.pause()
        el.volume = 0
        setPlaying(false)
      }
    }
    el.addEventListener('error', fail)
    document.addEventListener('visibilitychange', pauseHidden)
    // Сохранённое согласие используется только при новом явном действии.
    const consentedInteraction = () => {
      if (preference.current && !document.hidden && el.paused) {
        el.volume = 0
        void el
          .play()
          .then(() => {
            setPlaying(true)
            smoothVolume(el, Math.max(0, Math.min(1, Number(level.current) || 0)), fadeFrame)
          })
          .catch(() => {
            /* Автозапуск может быть отклонён браузером. */
          })
      }
    }
    document.addEventListener('pointerdown', consentedInteraction)
    document.addEventListener('keydown', consentedInteraction)
    return () => {
      cancelAnimationFrame(fadeFrame.current)
      el.pause()
      el.removeEventListener('error', fail)
      document.removeEventListener('pointerdown', consentedInteraction)
      document.removeEventListener('keydown', consentedInteraction)
      document.removeEventListener('visibilitychange', pauseHidden)
    }
  }, [])

  function fadeTo(target: number, pause = false) {
    const el = audio.current
    if (!el) return
    smoothVolume(el, target, fade, pause)
  }
  async function toggle() {
    if (playing) {
      preference.current = false
      setEnabled(false)
      setPlaying(false)
      fadeTo(0, true)
    } else if (audio.current) {
      try {
        await audio.current.play()
        preference.current = true
        setEnabled(true)
        setPlaying(true)
        setError(false)
        fadeTo(Math.max(0, Math.min(1, Number(volume) || 0)))
      } catch {
        setError(true)
      }
    }
  }
  return (
    <div
      className="music-control"
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        className="sound-button"
        onClick={() => {
          setPanel(!panel)
        }}
        aria-expanded={panel}
        aria-controls="music-panel"
      >
        <Music2 size={15} />
        <span>Музыка</span>
        <span className={playing ? 'sound-indicator on' : 'sound-indicator'} />
      </button>
      {panel && (
        <div id="music-panel" className="music-panel">
          <p className="small-label">Тихое сопровождение</p>
          <button
            className="text-button"
            onClick={() => {
              void toggle()
            }}
            disabled={!giftConfig.music.src}
          >
            {playing ? <VolumeX size={18} /> : <Volume2 size={18} />}
            {playing ? 'Выключить музыку' : 'Включить музыку'}
          </button>
          <label htmlFor="volume">
            Громкость{' '}
            <span>{Math.round(Math.max(0, Math.min(1, Number(volume) || 0)) * 100)}%</span>
          </label>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step=".01"
            value={Math.max(0, Math.min(1, Number(volume) || 0))}
            onChange={(e) => {
              const v = Number(e.target.value)
              setVolume(v)
              fadeTo(v)
            }}
          />
          <p className="music-note" role="status">
            {error
              ? 'Музыка недоступна. Можно продолжить в тишине.'
              : !giftConfig.music.src
                ? 'Этот подарок можно смотреть в тишине.'
                : giftConfig.music.title}
          </p>
          <button className="text-button panel-dismiss" onClick={() => setPanel(false)}>
            Закрыть настройки
          </button>
          {giftConfig.music.credit && (
            <p className="music-attribution">
              <a href={giftConfig.music.credit.sourceUrl} target="_blank" rel="noreferrer">
                {giftConfig.music.credit.title}
              </a>{' '}
              by {giftConfig.music.credit.artist} — released under{' '}
              <a href={giftConfig.music.credit.licenseUrl} target="_blank" rel="noreferrer">
                CC BY 4.0
              </a>
              .
            </p>
          )}
        </div>
      )}
    </div>
  )
}

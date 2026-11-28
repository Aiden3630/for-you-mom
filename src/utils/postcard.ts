import { giftConfig, personalize, publicAsset } from '../config/gift.config'

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = candidate
  }
  if (line) lines.push(line)
  return lines
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Изображение недоступно'))
    image.src = src
  })
}

async function drawFamilyCard(ctx: CanvasRenderingContext2D) {
  let photo: HTMLImageElement | undefined
  if (giftConfig.final.photo) {
    try {
      photo = await loadImage(publicAsset(giftConfig.final.photo))
    } catch {
      // Открытку можно сохранить и без фотографии.
    }
  }
  ctx.save()
  ctx.translate(700, 975)
  ctx.rotate(-0.025)
  ctx.shadowColor = '#694d4626'
  ctx.shadowBlur = 35
  ctx.shadowOffsetY = 14
  ctx.fillStyle = '#fffdf9'
  ctx.fillRect(-380, -525, 760, 1050)
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = '#f2e6dc'
  ctx.fillRect(-340, -485, 680, 900)
  if (photo) {
    const scale = Math.min(680 / photo.naturalWidth, 900 / photo.naturalHeight)
    const width = photo.naturalWidth * scale
    const height = photo.naturalHeight * scale
    ctx.drawImage(photo, -width / 2, -35 - height / 2, width, height)
  } else {
    ctx.save()
    ctx.translate(0, -80)
    ctx.beginPath()
    ctx.moveTo(0, 150)
    ctx.bezierCurveTo(-330, -70, -170, -290, 0, -120)
    ctx.bezierCurveTo(170, -290, 330, -70, 0, 150)
    ctx.strokeStyle = giftConfig.palette.rose
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.fillStyle = giftConfig.palette.rose
    ctx.font = 'italic 76px "Cormorant Garamond", serif'
    ctx.fillText(giftConfig.motherName, 0, 0, 280)
    ctx.restore()
  }
  ctx.fillStyle = giftConfig.palette.rose
  ctx.font = 'italic 55px "Cormorant Garamond", serif'
  ctx.fillText(personalize(giftConfig.final.love), 0, 488, 650)
  ctx.restore()
}

export async function createPostcard(
  svg: SVGSVGElement | null,
  kind: 'bouquet' | 'final',
): Promise<Blob> {
  await document.fonts.ready
  const canvas = document.createElement('canvas')
  canvas.width = 1400
  canvas.height = 1900
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas недоступен')
  const { palette } = giftConfig
  const background = ctx.createLinearGradient(0, 0, 1400, 1900)
  background.addColorStop(0, palette.cream)
  background.addColorStop(1, '#f5e4df')
  ctx.fillStyle = kind === 'final' ? background : palette.cream
  ctx.fillRect(0, 0, 1400, 1900)
  ctx.strokeStyle = palette.gold
  ctx.lineWidth = 1.5
  ctx.strokeRect(64, 64, 1272, 1772)
  ctx.strokeStyle = '#e4d8c9'
  ctx.strokeRect(79, 79, 1242, 1742)
  ctx.textAlign = 'center'
  ctx.fillStyle = palette.brown
  ctx.font = '500 25px Manrope, sans-serif'
  ctx.fillText(
    kind === 'final' ? 'САМЫЕ ДОРОГИЕ МОМЕНТЫ – РЯДОМ С ТОБОЙ' : 'С ЛЮБОВЬЮ. ДЛЯ ТЕБЯ.',
    700,
    165,
    1100,
  )
  const title =
    kind === 'bouquet' ? `Для тебя, ${giftConfig.motherName}` : personalize(giftConfig.final.title)
  ctx.font = '400 91px "Cormorant Garamond", serif'
  const titleLines = wrapText(ctx, title, 1120)
  titleLines.forEach((line, i) => ctx.fillText(line, 700, 290 + i * 95))
  if (kind === 'final') {
    await drawFamilyCard(ctx)
  } else {
    if (!svg) throw new Error('Букет ещё загружается')
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute('width', '580')
    clone.setAttribute('height', '650')
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(clone)], {
        type: 'image/svg+xml;charset=utf-8',
      }),
    )
    try {
      const img = await loadImage(url)
      const artTop = titleLines.length > 1 ? 435 : 340
      ctx.drawImage(img, 200, artTop, 1000, 1120)
    } finally {
      URL.revokeObjectURL(url)
    }
  }
  ctx.fillStyle = palette.brown
  ctx.font = '400 35px Manrope, sans-serif'
  const message =
    kind === 'bouquet'
      ? 'Эти цветы никогда не завянут. Как и моя благодарность тебе.'
      : personalize(giftConfig.final.text)
  wrapText(ctx, message, 1060).forEach((line, i) => ctx.fillText(line, 700, 1570 + i * 54))
  ctx.fillStyle = palette.rose
  ctx.font = 'italic 58px "Cormorant Garamond", serif'
  ctx.fillText(personalize(giftConfig.final.signature), 700, 1765, 1120)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG недоступен'))),
      'image/png',
    ),
  )
}

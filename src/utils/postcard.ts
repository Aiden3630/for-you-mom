import { giftConfig, personalize } from '../config/gift.config'

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

export async function createPostcard(svg: SVGSVGElement, kind: 'bouquet' | 'final'): Promise<Blob> {
  await document.fonts.ready
  const canvas = document.createElement('canvas')
  canvas.width = 1400
  canvas.height = 1900
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas недоступен')
  const { palette } = giftConfig
  ctx.fillStyle = palette.cream
  ctx.fillRect(0, 0, 1400, 1900)
  ctx.strokeStyle = palette.gold
  ctx.lineWidth = 1.5
  ctx.strokeRect(64, 64, 1272, 1772)
  ctx.strokeStyle = '#e4d8c9'
  ctx.strokeRect(79, 79, 1242, 1742)
  ctx.textAlign = 'center'
  ctx.fillStyle = palette.brown
  ctx.font = '500 25px Manrope, sans-serif'
  ctx.fillText('С ЛЮБОВЬЮ. ДЛЯ ТЕБЯ.', 700, 165)
  const title =
    kind === 'bouquet' ? `Для тебя, ${giftConfig.motherName}` : personalize(giftConfig.final.title)
  ctx.font = '400 91px "Cormorant Garamond", serif'
  const titleLines = wrapText(ctx, title, 1120)
  titleLines.forEach((line, i) => ctx.fillText(line, 700, 290 + i * 95))
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
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
    const artTop = titleLines.length > 1 ? 435 : 340
    ctx.drawImage(img, 200, artTop, 1000, 1120)
  } finally {
    URL.revokeObjectURL(url)
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

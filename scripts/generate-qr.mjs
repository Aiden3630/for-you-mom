import QRCode from 'qrcode'
import { mkdir, writeFile } from 'node:fs/promises'

const address = process.argv[2]
if (!address) {
  console.error('Укажите окончательный адрес: npm run qr -- https://ваш-сайт.example/')
  process.exit(1)
}
let url
try {
  url = new URL(address)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
} catch {
  console.error('Нужен полный адрес http:// или https://')
  process.exit(1)
}
const options = {
  errorCorrectionLevel: 'H',
  margin: 4,
  width: 1000,
  color: { dark: '#694D46', light: '#FFF8F0' },
}
await mkdir('delivery', { recursive: true })
await QRCode.toFile('delivery/qr.png', url.href, options)
await writeFile('delivery/qr.svg', await QRCode.toString(url.href, { ...options, type: 'svg' }))
await writeFile('delivery/final-url.txt', url.href + '\n')
console.log(
  'Созданы delivery/qr.png, delivery/qr.svg. Откройте delivery/card.html: QR появится автоматически. Проверьте его камерой телефона перед печатью.',
)

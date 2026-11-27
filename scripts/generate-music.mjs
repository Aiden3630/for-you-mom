import { mkdir, writeFile } from 'node:fs/promises'

// Оригинальная алгоритмическая миниатюра, написанная для подарка. CC0.
// Тихие фортепианные обертоны; без сэмплов и заимствованных мелодий.
const rate = 22050
const seconds = 48
const samples = new Float32Array(rate * seconds)
const chords = [
  [48, 55, 60, 64, 67],
  [45, 52, 57, 60, 64],
  [41, 48, 53, 57, 60],
  [43, 50, 55, 59, 62],
]
for (let bar = 0; bar < 8; bar++) {
  const chord = chords[bar % chords.length]
  for (let note = 0; note < 8; note++) {
    const start = bar * 6 + note * 0.75
    const midi = chord[[0, 2, 3, 4, 2, 1, 3, 2][note]] + (note % 4 === 3 ? 12 : 0)
    const hz = 440 * 2 ** ((midi - 69) / 12)
    for (let j = 0; j < rate * 4; j++) {
      const offset = Math.floor(start * rate) + j
      if (offset >= samples.length) break
      const t = j / rate
      const env = (1 - Math.exp(-t * 35)) * Math.exp(-t * 1.45)
      const tone =
        Math.sin(2 * Math.PI * hz * t) +
        0.25 * Math.sin(2 * Math.PI * hz * 2.002 * t) * Math.exp(-t * 2) +
        0.075 * Math.sin(2 * Math.PI * hz * 3 * t) * Math.exp(-t * 4)
      samples[offset] += tone * env * 0.14
    }
  }
}
const data = Buffer.alloc(44 + samples.length * 2)
data.write('RIFF', 0)
data.writeUInt32LE(data.length - 8, 4)
data.write('WAVEfmt ', 8)
data.writeUInt32LE(16, 16)
data.writeUInt16LE(1, 20)
data.writeUInt16LE(1, 22)
data.writeUInt32LE(rate, 24)
data.writeUInt32LE(rate * 2, 28)
data.writeUInt16LE(2, 32)
data.writeUInt16LE(16, 34)
data.write('data', 36)
data.writeUInt32LE(samples.length * 2, 40)
for (let i = 0; i < samples.length; i++) {
  const fade = Math.min(1, i / rate / 2, (samples.length - i) / rate / 3)
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i] * fade)) * 32767), 44 + i * 2)
}
await mkdir('public/music', { recursive: true })
await writeFile('public/music/quiet-garden.wav', data)
console.log('Оригинальная музыка: public/music/quiet-garden.wav · 48 секунд · CC0')

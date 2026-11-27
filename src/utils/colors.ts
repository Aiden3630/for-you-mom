// Смешивание оттенков позволяет сменить художественную палитру из конфигурации.
export function mixColors(first: string, second: string, amount: number) {
  const parse = (value: string) => {
    const hex = value.replace('#', '')
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex
    return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16) || 0)
  }
  const a = parse(first)
  const b = parse(second)
  return (
    '#' +
    a
      .map((v, i) =>
        Math.round(v + (b[i] - v) * amount)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  )
}

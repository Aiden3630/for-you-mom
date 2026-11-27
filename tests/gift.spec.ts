import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const chapters = ['intro', 'letter', 'memories', 'thanks', 'garden', 'bouquet', 'final']
const labels = ['Для тебя', 'Письмо', 'Воспоминания', 'Спасибо', 'Сад', 'Букет', 'С любовью']

async function chapter(page: Page, index: number) {
  await page
    .getByRole('navigation', { name: 'Главы подарка' })
    .getByRole('button', { name: `Глава ${index + 1}: ${labels[index]}`, exact: true })
    .click()
  await expect(page.locator(`.chapter-${chapters[index]} #chapter-heading`)).toBeVisible()
}

test('Полное путешествие: конверт, письма, сад, PNG, секрет, повтор', async ({ page }, info) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  await page.goto('/')
  await expect(page).toHaveTitle('Для тебя, мам')
  await page.getByRole('button', { name: 'Открыть письмо', exact: true }).click()
  await expect(page.locator('.letter-paper')).toBeVisible()
  const reveal = page.getByRole('button', { name: 'Показать всё письмо' })
  if (await reveal.isVisible()) await reveal.click()
  await expect(page.getByText('Этот маленький подарок я создал специально для тебя.')).toBeVisible()
  await page.getByRole('button', { name: 'Дальше', exact: true }).click()
  await expect(page.locator('.polaroid img')).toHaveCount(2)
  await expect
    .poll(() =>
      page
        .locator('.polaroid img')
        .first()
        .evaluate((e) => (e as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0)
  await chapter(page, 3)
  for (let i = 0; i < 10; i++) await page.locator('.mini-envelope').nth(i).click()
  await expect(page.getByText('Открыто 10 из 10', { exact: false })).toBeVisible()
  await expect(page.locator('.thank-message h2')).toHaveText('За то, что ты моя мама')
  await chapter(page, 4)
  await page.getByRole('button', { name: 'Распустить цветок: Здоровья', exact: true }).click()
  await expect(page.locator('.wish-message h2')).toHaveText('Здоровья')
  await page.getByRole('button', { name: 'Расцветить весь сад' }).click()
  await expect(page.locator('.garden-flower.is-bloomed')).toHaveCount(7)
  await chapter(page, 5)
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Сохранить букет', exact: true }).click()
  const download = await downloadEvent
  const file = `output/playwright/${info.project.name}-bouquet.png`
  await download.saveAs(file)
  const bytes = await readFile(file)
  expect(bytes.subarray(1, 4).toString()).toBe('PNG')
  expect(bytes.readUInt32BE(16)).toBe(1400)
  expect(bytes.readUInt32BE(20)).toBe(1900)
  expect(bytes.length).toBeGreaterThan(100_000)
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click()
  await chapter(page, 6)
  await expect(page.getByText('С Днём матери, мамочка!', { exact: true })).toBeVisible()
  const finalDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Сохранить открытку', exact: true }).click()
  await (await finalDownload).saveAs(`output/playwright/${info.project.name}-final.png`)
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click()
  await page.getByRole('button', { name: 'Маленький секрет' }).click()
  await expect(page.getByRole('dialog')).toContainText('Даже когда я становлюсь взрослым')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Маленький секрет' })).toBeFocused()
  await page.getByRole('button', { name: 'Посмотреть ещё раз' }).click()
  await expect(page.getByRole('button', { name: 'Открыть письмо', exact: true })).toBeVisible()
  await chapter(page, 3)
  await expect(page.getByText('Открыто 0 из 10', { exact: false })).toBeVisible()
  expect(errors).toEqual([])
})

test('Оглавление, клавиатура, фокус и уменьшение движения', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Оглавление', exact: true }).focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Оглавление подарка' })
  await expect(dialog).toBeVisible()
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    expect(
      await page.evaluate(() => document.querySelector('dialog')?.contains(document.activeElement)),
    ).toBe(true)
  }
  await dialog.getByRole('button', { name: '05 Сад' }).click()
  await expect(page.locator('.garden-chapter')).toBeVisible()
  expect(
    await page
      .locator('.petal')
      .first()
      .evaluate((e) => getComputedStyle(e.parentElement!).display),
  ).toBe('none')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('Музыка: явный запуск, затухание, громкость и сохранение', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Музыка', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Включить музыку', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Включить музыку', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Выключить музыку', exact: true })).toBeVisible()
  await page.getByLabel('Громкость').fill('0.4')
  await expect.poll(() => page.evaluate(() => localStorage.getItem('mom-gift-volume'))).toBe('0.4')
  await page.getByRole('button', { name: 'Выключить музыку', exact: true }).click()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('mom-gift-music'))).toBe('false')
  await page.reload()
  await page.getByRole('button', { name: 'Музыка', exact: true }).click()
  await expect(page.getByLabel('Громкость')).toHaveValue('0.4')
  await expect(page.getByRole('button', { name: 'Включить музыку', exact: true })).toBeVisible()
})

test('Нет музыкального файла и недоступен localStorage', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage unavailable')
      },
    })
  })
  await page.route('**/src/config/gift.config.ts*', async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replace('music/amberlight.mp3', 'music/test-missing.mp3')
    await route.fulfill({ response, body })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Музыка', exact: true }).click()
  await page.getByRole('button', { name: 'Включить музыку', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Музыка недоступна. Можно продолжить в тишине.')
  await page.getByRole('button', { name: 'Закрыть настройки' }).click()
  await page.getByRole('button', { name: 'Открыть письмо', exact: true }).click()
  await expect(page.locator('.letter-paper')).toBeVisible()
})

test('Альбом с файлами: загрузка, пагинация, свайп, увеличение и ошибка', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  // Только тестовый перехват модуля; личная конфигурация на диске не меняется.
  const fixtures = [0, 1, 2, 3, 4].map((i) => ({
    src: i === 4 ? 'photos/test-missing.png' : `photos/test-${i}.svg`,
    caption: `Тестовый снимок ${i + 1}`,
    alt: `Абстрактный тестовый цвет ${i + 1}`,
    date: 'Тест',
  }))
  await page.route('**/src/config/gift.config.ts*', async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replace(
      /photos:\s*\[[\s\S]*?\],(?=\s*music:)/,
      `photos: ${JSON.stringify(fixtures)},`,
    )
    await route.fulfill({ response, body })
  })
  await page.route('**/photos/test-*.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500"><rect width="600" height="500" fill="#a8b5a2"/><circle cx="300" cy="250" r="110" fill="#e8b4b8"/></svg>',
    }),
  )
  await page.route('**/photos/test-missing.png', (route) =>
    route.fulfill({ status: 404, body: 'missing' }),
  )
  await page.goto('/#memories')
  await expect(page.locator('.polaroid img')).toHaveCount(1)
  await expect
    .poll(() =>
      page
        .locator('.polaroid img')
        .first()
        .evaluate((e) => (e as HTMLImageElement).naturalWidth),
    )
    .toBe(600)
  await page.getByRole('button', { name: 'Увеличить фото: Тестовый снимок 1', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Следующее фото', exact: true }).click()
  await expect(page.locator('figcaption')).toContainText('Тестовый снимок 2')
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('button', { name: 'Увеличить фото: Тестовый снимок 1', exact: true }),
  ).toBeFocused()
  await page.getByRole('button', { name: 'Следующая страница альбома' }).click()
  await expect(page.getByText('2 / 5', { exact: true })).toBeVisible()
  await page.locator('.album').evaluate((el) => {
    const start = new Event('touchstart', { bubbles: true })
    Object.defineProperty(start, 'touches', { value: [{ clientX: 320, clientY: 250 }] })
    el.dispatchEvent(start)
  })
  await page.locator('.album').evaluate((el) => {
    const end = new Event('touchend', { bubbles: true })
    Object.defineProperty(end, 'changedTouches', { value: [{ clientX: 80, clientY: 250 }] })
    el.dispatchEvent(end)
  })
  await expect(page.getByText('3 / 5', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Следующая страница альбома' }).click()
  await page.getByRole('button', { name: 'Следующая страница альбома' }).click()
  await expect(page.getByText('5 / 5', { exact: true })).toBeVisible()
  await expect(page.getByText('Снимок пока недоступен')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Следующая страница альбома' })).toBeDisabled()
})

test('Отключённые главы и неизвестный hash', async ({ page }) => {
  await page.route('**/src/config/gift.config.ts*', async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replace(
      /(id:\s*["']memories["'][\s\S]*?enabled:\s*)true/,
      '$1false',
    )
    await route.fulfill({ response, body })
  })
  await page.goto('/#no-such-chapter')
  await expect(page.getByRole('button', { name: 'Открыть письмо', exact: true })).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Главы подарка' }).getByRole('button'),
  ).toHaveCount(6)
  await page.getByRole('button', { name: 'Открыть письмо', exact: true }).click()
  await page.getByRole('button', { name: 'Дальше', exact: true }).click()
  await expect(page.locator('.thanks-chapter')).toBeVisible()
})

test('Скриншоты семи глав и отсутствие переполнения на шести ширинах', async ({ page }, info) => {
  test.skip(info.project.name !== 'edge', 'Полная матрица размеров сохраняется один раз в Edge')
  test.setTimeout(120_000)
  await mkdir('output/playwright', { recursive: true })
  const measurements: object[] = []
  for (const width of [320, 360, 390, 768, 1024, 1920]) {
    await page.setViewportSize({ width, height: width > 767 ? 1080 : 844 })
    await page.goto('/')
    for (let i = 0; i < chapters.length; i++) {
      if (i > 0) await chapter(page, i)
      await page.evaluate(() => document.fonts.ready)
      const dimensions = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        width: innerWidth,
      }))
      expect(dimensions.scroll, `${chapters[i]} @ ${width}`).toBeLessThanOrEqual(width)
      const headingBox = await page.locator('#chapter-heading').boundingBox()
      expect(headingBox?.x).toBeGreaterThanOrEqual(0)
      const clipped = await page
        .locator('.mini-envelope, .garden-flower, .polaroid, .primary-button, .secondary-button')
        .evaluateAll((elements) =>
          elements
            .map((e) => ({
              left: e.getBoundingClientRect().left,
              right: e.getBoundingClientRect().right,
            }))
            .filter((box) => box.left < -1 || box.right > innerWidth + 1),
        )
      expect(clipped, `Обрезанные элементы ${chapters[i]} @ ${width}`).toEqual([])
      measurements.push({ chapter: chapters[i], width, ...dimensions })
      if (width === 390 || width === 1920) {
        if (i === 3) await page.locator('.mini-envelope').first().click()
        if (i === 4) await page.getByRole('button', { name: 'Расцветить весь сад' }).click()
        await page.screenshot({
          path: `output/playwright/${String(i + 1).padStart(2, '0')}-${chapters[i]}-${width === 390 ? 'mobile' : 'desktop'}.png`,
          fullPage: true,
          animations: 'disabled',
        })
      }
    }
  }
  await writeFile('output/playwright/responsive.json', JSON.stringify(measurements, null, 2))
})

test('Конверт открывается с обычной анимацией', async ({ page }, info) => {
  test.skip(info.project.name !== 'edge')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Открыть письмо', exact: true }).click()
  await expect(page.locator('.envelope-scene')).toHaveClass(/is-opening/)
  await expect(page.locator('.letter-paper')).toBeVisible()
  const reveal = page.getByRole('button', { name: 'Показать всё письмо' })
  if (await reveal.isVisible()) await reveal.click()
  await expect(page.locator('.letter-body p').last()).toHaveCSS('opacity', '1')
})

test('Сохранённое согласие ждёт действия; единственная глава остаётся интерактивной', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'edge')
  await page.addInitScript(() => {
    localStorage.setItem('mom-gift-music', 'true')
    localStorage.setItem('mom-gift-volume', '0.3')
  })
  await page.route('**/src/config/gift.config.ts*', async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replaceAll('enabled: true', 'enabled: false')
    await route.fulfill({ response, body })
  })
  await page.goto('/')
  await expect(page.locator('.sound-indicator.on')).toHaveCount(0)
  await expect(page.locator('.chapter-nav button')).toHaveCount(1)
  await page.getByRole('button', { name: 'Музыка', exact: true }).click()
  await page.getByRole('button', { name: 'Включить музыку', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Выключить музыку', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Закрыть настройки' }).click()
  await page.getByRole('button', { name: 'Открыть письмо', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Закрыть конверт', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Закрыть конверт', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Открыть письмо', exact: true })).toBeEnabled()
})

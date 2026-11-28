import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('Наши пять фотографий целиком: телефон, свайпы, увеличение и поворот экрана', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#memories')
  await expect(page.locator('.polaroid img')).toHaveCount(1)
  const visited: string[] = []
  for (let i = 0; i < 5; i++) {
    await expect(page.locator('.album-pagination > span').first()).toHaveText(`${i + 1} / 5`)
    const image = page.locator('.polaroid img')
    await expect(image).toHaveAttribute(
      'src',
      new RegExp(`family-0${i + 1}${i === 4 ? '-new' : ''}\\.jpg$`),
    )
    await expect
      .poll(() => image.evaluate((e) => (e as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0)
    await expect(image).toHaveCSS('object-fit', 'contain')
    const size = await image.boundingBox()
    expect(size!.width).toBeGreaterThan(250)
    visited.push((await image.getAttribute('src'))!)
    if (i < 4) await page.getByRole('button', { name: 'Следующая страница альбома' }).click()
  }
  expect(new Set(visited).size).toBe(5)
  await expect(page.getByRole('button', { name: 'Следующая страница альбома' })).toBeDisabled()
  await page.setViewportSize({ width: 1024, height: 768 })
  await expect(page.locator('.album-pagination > span').first()).toHaveText('3 / 3')
  await expect(page.locator('.polaroid img')).toHaveCount(1)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('.album-pagination > span').first()).toHaveText('5 / 5')
  await page.locator('.polaroid').click()
  await expect(page.locator('.photo-position')).toHaveText('5 / 5')
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator('.photo-position')).toHaveText('4 / 5')
  await page.locator('.photo-modal figure').evaluate((el) => {
    const start = new Event('touchstart', { bubbles: true })
    Object.defineProperty(start, 'touches', { value: [{ clientX: 300, clientY: 200 }] })
    el.dispatchEvent(start)
  })
  await page.locator('.photo-modal figure').evaluate((el) => {
    const end = new Event('touchend', { bubbles: true })
    Object.defineProperty(end, 'changedTouches', { value: [{ clientX: 50, clientY: 205 }] })
    el.dispatchEvent(end)
  })
  await expect(page.locator('.photo-position')).toHaveText('5 / 5')
  await page.keyboard.press('Escape')
  await expect(page.locator('.polaroid')).toBeFocused()
  if (info.project.name === 'edge')
    await page.screenshot({ path: 'output/playwright/album-personal-mobile.png', fullPage: true })
})

test('Amberlight: настоящий MP3, авторство, автоматический запуск и непрерывность', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      ;(window as unknown as { giftTestAudio: HTMLMediaElement }).giftTestAudio = this
      return play.call(this)
    }
  })
  await page.goto('/')
  await expect
    .poll(() =>
      page.evaluate(() =>
        Boolean((window as unknown as { giftTestAudio?: HTMLMediaElement }).giftTestAudio),
      ),
    )
    .toBe(true)
  await page.getByRole('button', { name: 'Музыка', exact: true }).click()
  await expect(page.locator('.music-attribution')).toContainText('Scott Buckley')
  await expect(page.getByRole('button', { name: 'Выключить музыку', exact: true })).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => {
        const audio = (window as unknown as { giftTestAudio: HTMLMediaElement }).giftTestAudio
        return audio?.duration || 0
      }),
    )
    .toBeGreaterThan(60)
  const firstTime = await page.evaluate(
    () => (window as unknown as { giftTestAudio: HTMLMediaElement }).giftTestAudio.currentTime,
  )
  await page.getByRole('button', { name: 'Закрыть настройки' }).click()
  await page.getByRole('button', { name: 'Открыть письмо', exact: true }).click()
  await expect(page.locator('.letter-paper')).toBeVisible()
  expect(
    await page.evaluate(
      () => (window as unknown as { giftTestAudio: HTMLMediaElement }).giftTestAudio.currentSrc,
    ),
  ).toContain('/music/amberlight.mp3')
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { giftTestAudio: HTMLMediaElement }).giftTestAudio.currentTime,
      ),
    )
    .toBeGreaterThan(firstTime)
  await page.getByRole('button', { name: 'Музыка', exact: true }).click()
  await page.getByRole('button', { name: 'Выключить музыку', exact: true }).click()
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { giftTestAudio: HTMLMediaElement }).giftTestAudio.paused,
      ),
    )
    .toBe(true)
  const header = await readFile('public/music/amberlight.mp3')
  expect(header.length).toBe(11319612)
})

test('Блокировка автозапуска: звук после первого действия, выключение остаётся выключением', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      if (!navigator.userActivation.isActive) {
        return Promise.reject(new DOMException('Ждём касания', 'NotAllowedError'))
      }
      return play.call(this)
    }
  })
  await page.goto('/')
  await expect(page.locator('#chapter-heading')).toBeVisible()
  await expect(page.locator('.sound-indicator.on')).toHaveCount(0)
  await page.getByRole('button', { name: 'Открыть письмо', exact: true }).click()
  await expect(page.locator('.sound-indicator.on')).toHaveCount(1)
  await page.getByRole('button', { name: 'Музыка', exact: true }).click()
  await expect(page.locator('.music-note')).not.toContainText('недоступна')
  await page.getByRole('button', { name: 'Выключить музыку', exact: true }).click()
  await page.getByRole('button', { name: 'Закрыть настройки' }).click()
  await page.getByRole('button', { name: 'Дальше', exact: true }).click()
  await expect(page.locator('.sound-indicator.on')).toHaveCount(0)
  await page.reload()
  await page.getByRole('button', { name: 'Музыка', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Включить музыку', exact: true })).toBeVisible()
})

test('Альбом без фотографий остаётся аккуратным', async ({ page }) => {
  await page.route('**/src/config/gift.config.ts*', async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replace(
      /photos:\s*\[[\s\S]*?\],(?=\s*music:)/,
      'photos: [],',
    )
    await route.fulfill({ response, body })
  })
  await page.goto('/#memories')
  await expect(page.locator('.empty-polaroid')).toHaveCount(2)
  await expect(
    page.getByText('В этом альбоме есть место для наших настоящих фотографий.'),
  ).toBeVisible()
})

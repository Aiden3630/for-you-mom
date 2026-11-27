export type ChapterId = 'intro' | 'letter' | 'memories' | 'thanks' | 'garden' | 'bouquet' | 'final'
export type GiftPhoto = {
  src: string
  caption: string
  date?: string
  alt: string
  width?: number
  height?: number
}

export interface GiftConfig {
  motherName: string
  sonName: string
  siteTitle: string
  holidayDate: string
  intro: { eyebrow: string; title: string; text: string; envelopeLabel: string }
  letter: { greeting: string; paragraphs: string[]; closing: string }
  thanks: { title: string; text: string }[]
  wishes: { title: string; text: string }[]
  photos: GiftPhoto[]
  music: {
    src: string
    title: string
    defaultVolume: number
    credit?: { title: string; artist: string; sourceUrl: string; licenseUrl: string }
  }
  palette: {
    cream: string
    powder: string
    rose: string
    gold: string
    sage: string
    brown: string
  }
  final: { title: string; text: string; love: string; signature: string }
  secret: string
  chapters: { id: ChapterId; label: string; enabled: boolean }[]
}

// Всё личное — здесь. Пути к файлам указываются относительно public, без начального /.
export const giftConfig: GiftConfig = {
  motherName: 'мам',
  sonName: 'твой сын',
  siteTitle: 'Для тебя, мам',
  holidayDate: '2026-11-29',
  intro: {
    eyebrow: 'Маленький подарок с большой любовью',
    title: 'Для тебя, мам',
    text: 'Есть вещи, о которых я слишком редко говорю вслух. Сегодня я хочу это исправить.',
    envelopeLabel: 'Самому дорогому человеку',
  },
  letter: {
    greeting: 'Мам,',
    paragraphs: [
      'Возможно, я не так часто говорю тебе, насколько сильно ценю всё, что ты для меня делаешь.',
      'Спасибо тебе за твою заботу, терпение, поддержку и тепло. За то, что веришь в меня даже тогда, когда я сам сомневаюсь в себе.',
      'Я взрослею, у меня появляются собственные планы, цели и мечты. Но сколько бы лет ни прошло и куда бы меня ни привела жизнь, ты всегда будешь одним из самых дорогих для меня людей.',
      'Я хочу, чтобы ты чаще улыбалась, меньше переживала и знала, что всё, что ты для меня сделала, я никогда не забуду.',
      'Этот маленький подарок я создал специально для тебя.',
    ],
    closing: 'С Днём матери!',
  },
  thanks: [
    { title: 'За твою любовь', text: 'Её не нужно заслуживать. Я чувствую её даже на расстоянии.' },
    {
      title: 'За твоё терпение',
      text: 'За то, что слушаешь, понимаешь и даёшь мне время стать собой.',
    },
    {
      title: 'За твою заботу',
      text: 'В маленьких повседневных вещах так много твоего большого сердца.',
    },
    {
      title: 'За веру в меня',
      text: 'Твоя вера помогает сделать ещё один шаг, даже когда страшно.',
    },
    {
      title: 'За твою поддержку',
      text: 'Как хорошо знать, что рядом есть человек, которому можно всё рассказать.',
    },
    {
      title: 'За твою мудрость',
      text: 'С годами я всё лучше понимаю простые вещи, которым ты меня учишь.',
    },
    {
      title: 'За тепло нашего дома',
      text: 'Дом — это прежде всего чувство, что тебя любят. Спасибо за него.',
    },
    {
      title: 'За всё, чему ты научила',
      text: 'Быть добрее, замечать хорошее и не сдаваться. Это остаётся со мной.',
    },
    {
      title: 'За то, что ты рядом',
      text: 'Иногда достаточно просто услышать твой голос, чтобы стало спокойнее.',
    },
    {
      title: 'За то, что ты моя мама',
      text: 'Из всех слов самое тёплое для меня — «мама». Спасибо, что ты есть.',
    },
  ],
  wishes: [
    { title: 'Здоровья', text: 'Пусть сил хватает на всё, что приносит тебе радость.' },
    { title: 'Счастья', text: 'Большого и тихого. Такого, которое чувствуешь сердцем.' },
    {
      title: 'Душевного спокойствия',
      text: 'Пусть поводов для улыбки будет больше, чем поводов для тревоги.',
    },
    {
      title: 'Исполнения мечтаний',
      text: 'Пусть у тебя будет время для себя и для того, о чём давно мечтаешь.',
    },
    { title: 'Радостных дней', text: 'Пусть каждый день приносит хотя бы одну маленькую радость.' },
    { title: 'Тепла и любви', text: 'Пусть забота, которую ты даришь, возвращается к тебе.' },
    {
      title: 'Как можно больше улыбок',
      text: 'Твоя улыбка делает этот мир теплее. Улыбайся чаще, мам.',
    },
  ],
  photos: [
    {
      src: 'photos/family-01.jpg',
      caption: 'Рядом с тобой',
      alt: 'Наше совместное фото у окна',
      width: 960,
      height: 1280,
    },
    {
      src: 'photos/family-02.jpg',
      caption: 'Вместе',
      alt: 'Наше совместное фото на улице у воды',
      width: 1280,
      height: 960,
    },
    {
      src: 'photos/family-03.jpg',
      caption: 'Наши улыбки',
      alt: 'Весёлое совместное домашнее фото',
      width: 960,
      height: 1280,
    },
    {
      src: 'photos/family-04.jpg',
      caption: 'Самые тёплые моменты',
      alt: 'Наше совместное фото на диване',
      width: 960,
      height: 1280,
    },
    {
      src: 'photos/family-05-new.jpg',
      caption: 'Самые дорогие',
      alt: 'Наше совместное домашнее фото',
      width: 960,
      height: 1280,
    },
  ],
  music: {
    src: 'music/amberlight.mp3',
    title: 'Amberlight · Scott Buckley',
    defaultVolume: 0.25,
    credit: {
      title: 'Amberlight',
      artist: 'Scott Buckley',
      sourceUrl: 'https://www.scottbuckley.com.au/library/amberlight/',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
  palette: {
    cream: '#FFF8F0',
    powder: '#E8B4B8',
    rose: '#B76E79',
    gold: '#D4AF77',
    sage: '#A8B5A2',
    brown: '#694D46',
  },
  final: {
    title: 'С Днём матери, мамочка!',
    text: 'Пусть у тебя будет как можно больше счастливых дней. Спасибо, что ты есть.',
    love: 'Я люблю тебя',
    signature: 'С любовью, {son}',
  },
  secret: 'Даже когда я становлюсь взрослым, я всё равно остаюсь твоим сыном.',
  chapters: [
    { id: 'intro', label: 'Для тебя', enabled: true },
    { id: 'letter', label: 'Письмо', enabled: true },
    { id: 'memories', label: 'Воспоминания', enabled: true },
    { id: 'thanks', label: 'Спасибо', enabled: true },
    { id: 'garden', label: 'Сад', enabled: true },
    { id: 'bouquet', label: 'Букет', enabled: true },
    { id: 'final', label: 'С любовью', enabled: true },
  ],
}

export function personalize(text: string) {
  return text.replaceAll('{mom}', giftConfig.motherName).replaceAll('{son}', giftConfig.sonName)
}

export function publicAsset(path: string) {
  // Данные подарка остаются локальными; удалённые URL намеренно не поддерживаются.
  if (/^(https?:|data:|\/\/)/i.test(path)) return ''
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

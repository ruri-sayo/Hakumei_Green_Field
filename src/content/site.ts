import { t, type TranslationKey } from './i18n';
import latestConfig from './latest.config.json';
import tickerConfig from './ticker.config.json';

export const site = {
  name: t('site.name'),
  shortName: t('site.shortName'),
  description: t('site.description'),
};

export const navLinks = [
  { key: 'nav.home', label: t('nav.home'), href: '/' },
  { key: 'nav.articles', label: t('nav.articles'), href: '/articles/' },
  { key: 'nav.tools', label: t('nav.tools'), href: '/tools/' },
  { key: 'nav.games', label: t('nav.games'), href: '/games/' },
  { key: 'nav.novel', label: t('nav.novel'), href: '/novel/' },
  { key: 'nav.hakoniwa', label: t('nav.hakoniwa'), href: '/hakoniwa/' },
  { key: 'nav.about', label: t('nav.about'), href: '/about/' },
] satisfies Array<{ key: TranslationKey; label: string; href: string }>;

export const tickerSpeedSeconds = tickerConfig.speedSeconds;
export const tickerItems = tickerConfig.items.map((item) => ({
  ...item,
  label: item.label.japanese,
  text: item.text.japanese,
}));

export const latestItems = latestConfig.items.map((item) => ({
  ...item,
  titleText: item.title.japanese,
}));

export const sectionItems = [
  {
    id: 'human',
    titleKey: 'section.human.title',
    eyebrowKey: 'section.human.eyebrow',
    descriptionKey: 'section.human.description',
    title: t('section.human.title'),
    eyebrow: t('section.human.eyebrow'),
    description: t('section.human.description'),
    imageSrc: '/assets/h_article_image.png',
    href: '/articles/h/',
    tone: 'blue',
    icon: 'pen',
  },
  {
    id: 'system',
    titleKey: 'section.system.title',
    eyebrowKey: 'section.system.eyebrow',
    descriptionKey: 'section.system.description',
    title: t('section.system.title'),
    eyebrow: t('section.system.eyebrow'),
    description: t('section.system.description'),
    imageSrc: '/assets/s_articke_image.png',
    href: '/articles/s/',
    tone: 'green',
    icon: 'bot',
  },
  {
    id: 'tools',
    titleKey: 'section.tools.title',
    eyebrowKey: 'section.tools.eyebrow',
    descriptionKey: 'section.tools.description',
    title: t('section.tools.title'),
    eyebrow: t('section.tools.eyebrow'),
    description: t('section.tools.description'),
    imageSrc: '/assets/tool_logo.png',
    href: '/tools/',
    tone: 'orange',
    icon: 'tool',
  },
  {
    id: 'games',
    titleKey: 'section.games.title',
    eyebrowKey: 'section.games.eyebrow',
    descriptionKey: 'section.games.description',
    title: t('section.games.title'),
    eyebrow: t('section.games.eyebrow'),
    description: t('section.games.description'),
    href: '/games/',
    tone: 'violet',
    icon: 'game',
  },
  {
    id: 'novel',
    titleKey: 'section.novel.title',
    eyebrowKey: 'section.novel.eyebrow',
    descriptionKey: 'section.novel.description',
    title: t('section.novel.title'),
    eyebrow: t('section.novel.eyebrow'),
    description: t('section.novel.description'),
    imageSrc: '/assets/novel_logo.png',
    href: '/novel/',
    tone: 'muted',
    icon: 'book',
    comingSoon: true,
  },
  {
    id: 'hakoniwa',
    titleKey: 'section.hakoniwa.title',
    eyebrowKey: 'section.hakoniwa.eyebrow',
    descriptionKey: 'section.hakoniwa.description',
    title: t('section.hakoniwa.title'),
    eyebrow: t('section.hakoniwa.eyebrow'),
    description: t('section.hakoniwa.description'),
    href: '/hakoniwa/',
    tone: 'teal',
    icon: 'box',
    comingSoon: true,
  },
] satisfies Array<{
  id: string;
  titleKey: TranslationKey;
  eyebrowKey: TranslationKey;
  descriptionKey: TranslationKey;
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  tone: string;
  icon: string;
  imageSrc?: string;
  comingSoon?: boolean;
}>;

const page = (titleKey: TranslationKey, leadKey: TranslationKey) => ({
  titleKey,
  leadKey,
  title: t(titleKey),
  lead: t(leadKey),
});

export const pageSummaries = {
  articles: page('page.articles.title', 'page.articles.lead'),
  human: page('page.human.title', 'page.human.lead'),
  system: page('page.system.title', 'page.system.lead'),
  tools: page('page.tools.title', 'page.tools.lead'),
  games: page('page.games.title', 'page.games.lead'),
  novel: page('page.novel.title', 'page.novel.lead'),
  hakoniwa: page('page.hakoniwa.title', 'page.hakoniwa.lead'),
  about: page('page.about.title', 'page.about.lead'),
};

import { exampleReview } from './example-review';
import { smartphoneGuide } from './smartphone-guide';
import { laptopGuide } from './laptop-guide';
import { smartSpeakerGuide } from './smart-speaker-guide';
import type { Article, ArticleContentBlock, ArticleInlineToken } from '../../types/article';

interface CmsArticle {
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  imageAlt?: string;
  date: string;
  author?: string;
  seoTitle?: string;
  seoDescription?: string;
  body: string;
}

const categories: Record<string, { title: string; slug: string }> = {
  smartphones: { title: 'Smartphones', slug: 'smartphones' },
  computers: { title: 'Computers', slug: 'computers' },
  headphones: { title: 'Headphones', slug: 'headphones' },
  'smart-speakers': { title: 'Smart Speakers', slug: 'smart-speakers' },
};

const cmsFiles = import.meta.glob<CmsArticle>('../cms-articles/*.json', {
  eager: true,
  import: 'default',
});

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

function plainText(text: string) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .trim();
}

function parseInlineMarkdown(text: string): ArticleInlineToken[] {
  const tokens: ArticleInlineToken[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) tokens.push({ type: 'text', text: text.slice(cursor, index) });
    if (match[1] && match[2]) {
      const href = match[2].trim();
      if (/^(https?:\/\/|mailto:|\/|#)/i.test(href)) tokens.push({ type: 'link', text: match[1], href });
      else tokens.push({ type: 'text', text: match[1] });
    } else if (match[3] || match[4]) tokens.push({ type: 'strong', text: match[3] || match[4] });
    else if (match[5]) tokens.push({ type: 'code', text: match[5] });
    else tokens.push({ type: 'emphasis', text: match[6] || match[7] });
    cursor = index + match[0].length;
  }
  if (cursor < text.length) tokens.push({ type: 'text', text: text.slice(cursor) });
  return tokens;
}

function parseMarkdown(markdown: string): ArticleContentBlock[] {
  const blocks: ArticleContentBlock[] = [];
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let paragraph: string[] = [];
  let list: string[] = [];
  let listOrdered: boolean | undefined;

  const flushParagraph = () => {
    if (paragraph.length) {
      const text = plainText(paragraph.join(' '));
      if (text) blocks.push({ type: 'paragraph', text, parts: parseInlineMarkdown(paragraph.join(' ')) });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length && listOrdered !== undefined) {
      blocks.push({ type: 'list', ordered: listOrdered, items: list.map(plainText) });
    }
    list = [];
    listOrdered = undefined;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const text = plainText(heading[2]);
      blocks.push({
        type: 'heading',
        level: heading[1].length === 3 ? 3 : 2,
        id: slugifyHeading(text),
        text,
      });
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'image', alt: image[1], src: image[2] });
      continue;
    }

    const listItem = line.match(/^([-*+]\s+|\d+[.)]\s+)(.+)$/);
    if (listItem) {
      flushParagraph();
      const ordered = /^\d/.test(listItem[1]);
      if (listOrdered !== undefined && listOrdered !== ordered) flushList();
      listOrdered = ordered;
      list.push(plainText(listItem[2]));
      continue;
    }

    if (line.startsWith('|') && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) {
      flushParagraph();
      flushList();
      const parseCells = (value: string) => value.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => plainText(cell));
      const headers = parseCells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(parseCells(lines[index]));
        index += 1;
      }
      index -= 1;
      blocks.push({ type: 'table', headers, rows });
      continue;
    }

    flushList();
    paragraph.push(line.replace(/^>\s?/, ''));
  }

  flushParagraph();
  flushList();
  return blocks;
}

function toArticle(entry: CmsArticle): Article | undefined {
  const category = categories[entry.category];
  if (!category || !entry.title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) || !entry.description || !entry.image || !entry.date) return undefined;

  const blocks = parseMarkdown(entry.body || '');
  const tableOfContents = blocks
    .filter((block): block is Extract<ArticleContentBlock, { type: 'heading' }> => block.type === 'heading')
    .map(({ text, id, level }) => ({ label: text, id, level }));
  const publishedAt = entry.date.slice(0, 10);
  const parsedDate = new Date(`${publishedAt}T00:00:00`);
  const publishedLabel = Number.isNaN(parsedDate.getTime())
    ? publishedAt
    : parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const wordCount = (entry.body || '').trim().split(/\s+/).filter(Boolean).length;

  return {
    slug: entry.slug,
    category: category.title,
    categorySlug: category.slug,
    title: entry.title,
    summary: entry.description,
    seoTitle: entry.seoTitle,
    seoDescription: entry.seoDescription,
    author: entry.author?.trim() || undefined,
    publishedAt,
    publishedLabel,
    readingTime: `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
    coverImage: entry.image,
    coverAlt: entry.imageAlt?.trim() || entry.title,
    tableOfContents,
    blocks,
    demo: false,
  };
}

const existingSlugs = new Set([exampleReview, smartphoneGuide, laptopGuide, smartSpeakerGuide].map((article) => article.slug));
const cmsSlugs = new Set<string>();
const cmsArticles = Object.entries(cmsFiles).flatMap(([filePath, entry]) => {
  const article = toArticle(entry);
  if (!article) return [];
  if (existingSlugs.has(article.slug)) {
    throw new Error(`CMS article slug "${article.slug}" in ${filePath} conflicts with an existing TypeScript article. Choose a different slug.`);
  }
  if (cmsSlugs.has(article.slug)) {
    throw new Error(`CMS article slug "${article.slug}" is used more than once. Each article needs a unique slug.`);
  }
  cmsSlugs.add(article.slug);
  return [article];
});

// Keep legacy TypeScript articles untouched while allowing CMS-managed JSON articles to join the same routes and lists.
export const articles: Article[] = [exampleReview, smartphoneGuide, laptopGuide, smartSpeakerGuide, ...cmsArticles]
  .sort((first, second) => second.publishedAt.localeCompare(first.publishedAt));

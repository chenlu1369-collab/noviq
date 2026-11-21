import type { MarkdownInstance } from 'astro';
import type { Article, ArticleContentBlock, ArticleProduct } from '../../types/article';
import { exampleReview } from './example-review';
import { smartphoneGuide } from './smartphone-guide';
import { laptopGuide } from './laptop-guide';
import { smartSpeakerGuide } from './smart-speaker-guide';

interface CmsArticle {
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  description: string;
  image: string;
  imageAlt?: string;
  imageCaption?: string;
  date: string;
  publishedLabel?: string;
  readingTime?: string;
  author?: string;
  seoTitle?: string;
  seoDescription?: string;
  demo?: boolean;
  product?: ArticleProduct;
  pros?: string[];
  cons?: string[];
  related?: { category: string; title: string }[];
}

const categoryTitles: Record<string, string> = {
  smartphones: 'Smartphones',
  computers: 'Computers',
  headphones: 'Headphones',
  'smart-speakers': 'Smart Speakers',
};

const cmsFiles = import.meta.glob<MarkdownInstance<CmsArticle>>('../cms-articles/*.md', {
  eager: true,
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

function parseInlineMarkdown(text: string) {
  const tokens: NonNullable<Extract<ArticleContentBlock, { type: 'paragraph' }>['parts']> = [];
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
      const source = paragraph.join(' ');
      const text = plainText(source);
      if (text) blocks.push({ type: 'paragraph', text, parts: parseInlineMarkdown(source) });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length && listOrdered !== undefined) blocks.push({ type: 'list', ordered: listOrdered, items: list.map(plainText) });
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
      blocks.push({ type: 'heading', level: heading[1].length === 3 ? 3 : 2, id: slugifyHeading(text), text });
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      flushParagraph();
      flushList();
      const captionMatch = lines[index + 1]?.trim().match(/^\*([^*]+)\*$/);
      blocks.push({ type: 'image', alt: image[1], src: image[2], ...(captionMatch ? { caption: captionMatch[1] } : {}) });
      if (captionMatch) index += 1;
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
      let caption: string | undefined;
      if (paragraph.length === 1) {
        const captionMatch = paragraph[0].match(/^\*\*Table caption:\s*(.+)\*\*$/);
        if (captionMatch) {
          caption = captionMatch[1];
          paragraph = [];
        }
      }
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
      blocks.push({ type: 'table', ...(caption ? { caption } : {}), headers, rows });
      continue;
    }

    flushList();
    paragraph.push(line.replace(/^>\s?/, ''));
  }

  flushParagraph();
  flushList();
  return blocks;
}

function toArticle(entry: CmsArticle, body: string, filePath: string): Article {
  const categoryTitle = categoryTitles[entry.categorySlug];
  if (!categoryTitle) throw new Error(`Unknown article category "${entry.categorySlug}" in ${filePath}.`);
  if (!entry.title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) || !entry.description || !entry.image || !entry.date) {
    throw new Error(`Article ${filePath} is missing a required field or has an invalid slug.`);
  }

  const blocks = parseMarkdown(body);
  const headings = blocks.filter((block): block is Extract<ArticleContentBlock, { type: 'heading' }> => block.type === 'heading');
  const tableOfContents = headings.map(({ text, id, level }) => ({ label: text, id, level }));
  const publishedAt = entry.date.slice(0, 10);
  const parsedDate = new Date(`${publishedAt}T00:00:00`);
  const publishedLabel = entry.publishedLabel || (Number.isNaN(parsedDate.getTime())
    ? publishedAt
    : parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  return {
    slug: entry.slug,
    category: entry.category || categoryTitle,
    categorySlug: entry.categorySlug,
    title: entry.title,
    summary: entry.description,
    seoTitle: entry.seoTitle,
    seoDescription: entry.seoDescription,
    author: entry.author?.trim() || undefined,
    publishedAt,
    publishedLabel,
    readingTime: entry.readingTime || `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
    coverImage: entry.image,
    coverAlt: entry.imageAlt?.trim() || entry.title,
    imageCaption: entry.imageCaption,
    tableOfContents,
    blocks,
    product: entry.product,
    pros: entry.pros,
    cons: entry.cons,
    related: entry.related,
    demo: entry.demo ?? false,
  };
}

const legacyArticles = [exampleReview, smartphoneGuide, laptopGuide, smartSpeakerGuide];
const cmsSlugs = new Set<string>();
const cmsArticles = Object.entries(cmsFiles).map(([filePath, markdown]) => {
  const article = toArticle(markdown.frontmatter, markdown.rawContent(), filePath);
  if (cmsSlugs.has(article.slug)) throw new Error(`CMS article slug "${article.slug}" is used more than once.`);
  cmsSlugs.add(article.slug);
  return article;
});

// CMS files take precedence for migrated slugs; untouched TypeScript articles remain available as a safe fallback.
export const articles: Article[] = [
  ...legacyArticles.filter((article) => !cmsSlugs.has(article.slug)),
  ...cmsArticles,
].sort((first, second) => second.publishedAt.localeCompare(first.publishedAt));

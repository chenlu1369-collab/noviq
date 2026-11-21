export type ArticleInlineToken =
  | { type: 'text' | 'strong' | 'emphasis' | 'code'; text: string }
  | { type: 'link'; text: string; href: string };

export type ArticleContentBlock =
  | { type: 'paragraph'; text: string; parts?: ArticleInlineToken[] }
  | { type: 'heading'; level: 2 | 3; id: string; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; caption?: string; headers: string[]; rows: string[][] };

export interface ArticleProduct {
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  affiliateLinks?: AffiliateLink[];
}

export interface AffiliateLink {
  merchant: string;
  url: string;
  region?: string;
  active?: boolean;
}

export interface Article {
  slug: string;
  category: string;
  categorySlug?: string;
  title: string;
  summary: string;
  seoTitle?: string;
  seoDescription?: string;
  author?: string;
  publishedAt: string;
  publishedLabel: string;
  readingTime: string;
  coverImage: string;
  coverAlt: string;
  imageCaption?: string;
  tableOfContents: { label: string; id: string; level?: 2 | 3 }[];
  blocks: ArticleContentBlock[];
  product?: ArticleProduct;
  pros?: string[];
  cons?: string[];
  related?: { category: string; title: string }[];
  demo?: boolean;
}

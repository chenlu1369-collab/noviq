import type { Article } from '../../types/article';

// Demonstration-only article data. Replace this source with Sanity queries when the CMS is connected.
export const exampleReview: Article = {
  slug: 'example-review',
  category: 'Buying Guide',
  categorySlug: 'headphones',
  title: 'How to Compare Wireless Headphones for Everyday Listening',
  summary:
    'A practical framework for comparing fit, controls, connectivity, and care before choosing a pair of wireless headphones.',
  author: 'NOVIQ Editorial Team',
  publishedAt: '2026-11-20',
  publishedLabel: 'November 20, 2026',
  readingTime: '6 min read',
  coverImage:
    'https://images.unsplash.com/photo-1599955051125-571f47e04316?auto=format&fit=crop&w=1800&q=85',
  coverAlt: 'Over-ear headphones photographed against a soft gray background',
  tableOfContents: [
    { label: 'Start with fit and comfort', id: 'fit-and-comfort', level: 2 },
    { label: 'Over-ear or on-ear?', id: 'over-ear-or-on-ear', level: 3 },
    { label: 'Check the controls and connections', id: 'controls-and-connections', level: 2 },
    { label: 'Compare everyday features', id: 'everyday-features', level: 2 },
    { label: 'A simple comparison checklist', id: 'comparison-checklist', level: 2 },
  ],
  blocks: [
    {
      type: 'paragraph',
      text: 'Choosing headphones is easier when you focus on how they will fit into your routine. This demonstration guide offers a general comparison framework; it is not a hands-on review of a particular product.',
    },
    { type: 'heading', level: 2, id: 'fit-and-comfort', text: 'Start with fit and comfort' },
    {
      type: 'paragraph',
      text: 'Headphones can feel different over a short listen and a longer session. Consider the shape of the ear cups, the pressure of the headband, the weight, and whether the materials feel comfortable for the way you plan to use them.',
    },
    { type: 'heading', level: 3, id: 'over-ear-or-on-ear', text: 'Over-ear or on-ear?' },
    {
      type: 'paragraph',
      text: 'Over-ear designs surround the ears, while on-ear designs rest against them. Neither style suits everyone, so fit and personal preference are useful starting points when comparing options.',
    },
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1599955051125-571f47e04316?auto=format&fit=crop&w=1400&q=82',
      alt: 'A close view of wireless headphones in neutral studio lighting',
      caption: 'Illustrative product image for this demonstration article.',
    },
    { type: 'heading', level: 2, id: 'controls-and-connections', text: 'Check the controls and connections' },
    {
      type: 'paragraph',
      text: 'Look at how playback, calls, and volume are managed. Physical buttons, touch controls, and companion apps each offer a different interaction style. Check device compatibility and how easily the headphones reconnect to the devices you use.',
    },
    {
      type: 'list',
      ordered: false,
      items: [
        'Try the control layout and learn whether it can be customized.',
        'Confirm which Bluetooth features your everyday devices support.',
        'Review the maker’s guidance for pairing and software updates.',
      ],
    },
    { type: 'heading', level: 2, id: 'everyday-features', text: 'Compare everyday features' },
    {
      type: 'paragraph',
      text: 'Consider the features that matter in your own surroundings. Noise control, microphone behavior, portability, and charging arrangements can all influence daily use. Product specifications are most helpful when compared side by side and checked against the manufacturer’s current information.',
    },
    { type: 'heading', level: 2, id: 'comparison-checklist', text: 'A simple comparison checklist' },
    {
      type: 'paragraph',
      text: 'Use a short, consistent checklist to keep comparisons focused. The table below is a planning aid, not a set of product measurements or test results.',
    },
    {
      type: 'table',
      caption: 'Questions to consider while comparing headphones',
      headers: ['Area', 'Question to ask'],
      rows: [
        ['Fit', 'Does the shape feel comfortable for your typical listening session?'],
        ['Controls', 'Can you operate the features you use without friction?'],
        ['Compatibility', 'Will the headphones work with your usual devices?'],
        ['Care', 'Are charging, storage, and cleaning straightforward?'],
      ],
    },
  ],
  product: {
    name: 'Wireless Headphones (Demo Product)',
    description:
      'An illustrative product entry for previewing this layout. It does not represent a specific model or tested recommendation.',
    image:
      'https://images.unsplash.com/photo-1599955051125-571f47e04316?auto=format&fit=crop&w=900&q=82',
    imageAlt: 'Over-ear headphones photographed against a soft gray background',
  },
  pros: [
    'An over-ear format may suit listeners who prefer an around-ear fit.',
    'Wireless use can make moving between everyday activities more convenient.',
    'A clear control layout can simplify common playback tasks.',
  ],
  cons: [
    'Fit and comfort are personal and can vary between designs.',
    'Wireless headphones require charging as part of regular use.',
    'Some features depend on device compatibility or companion software.',
  ],
  related: [
    { category: 'Computers', title: 'A practical guide to comparing everyday laptops' },
    { category: 'Smart Speakers', title: 'What to consider before choosing a smart speaker' },
    { category: 'Smartphones', title: 'Understanding the features you use on a smartphone' },
  ],
};

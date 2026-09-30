export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  body: string[];
  image: string;
  publishedAt: string;
  featured?: boolean;
}

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: '1',
    category: 'RESCUE',
    title: 'Over 12,000 families evacuated as floodwaters breach Sunamganj embankments',
    excerpt: 'Coordinated rescue boats deployed across 14 upazilas to move stranded families to safety.',
    body: [
      'Floodwaters breached embankments in Sunamganj Sadar and neighbouring upazilas overnight, forcing the largest coordinated evacuation of this flood season. Rescue teams working with Shohay dispatched boats to 14 upazilas, moving families from waterlogged homes to government shelters and higher ground.',
      'Local coordinators report that most evacuees are now sheltered in schools and community centres with access to drinking water and emergency food supplies. District Control Rooms are continuing to track vulnerable households — the elderly, pregnant women, and families with young children — for priority relocation.',
      'Volunteers are being routed through Shohay\'s Command Center as new assistance requests come in from residents still trapped in flooded areas. Anyone needing rescue or relief can submit a request through Get Help or call 999.'
    ],
    image: '/photo-1728320771441-17a19df0fe4c.jpg',
    publishedAt: '2024-07-15',
    featured: true
  },
  {
    id: '2',
    category: 'HEALTH',
    title: 'Mobile medical units reach flood-isolated char communities in Sirajganj',
    excerpt: 'Mobile medical units reach flood-isolated char communities in Sirajganj.',
    body: [
      'Waterborne illness and limited access to clean drinking water remain the biggest health risks for communities stranded on the chars (river sandbars) of Sirajganj. Mobile medical teams have begun reaching these isolated areas by boat, carrying oral rehydration salts, basic medicines, and water purification tablets.',
      'Field volunteers report a rise in diarrheal illness among children in the areas visited so far, consistent with contaminated flood water entering the local water supply. Medical teams are prioritising infants, the elderly, and pregnant women for check-ups.',
      'Shohay is coordinating medical unit routes with district control rooms so that the most isolated char communities — often the last to receive aid — are reached first.'
    ],
    image: '/photo-1727475807090-f1c30f6c294f.jpg',
    publishedAt: '2024-07-14'
  },
  {
    id: '3',
    category: 'COMMUNITY',
    title: 'Women-led distribution networks ensure equitable relief in Netrokona',
    excerpt: 'Women-led distribution networks ensure equitable relief in Netrokona.',
    body: [
      'In Netrokona, local women\'s groups have organised themselves into a distribution network that ensures relief packages reach every household in their communities — not just those closest to the drop-off point. The groups keep their own household lists and flag families who might otherwise be missed, including women heading their households alone and families sheltering elderly relatives.',
      'Coordinators say this local knowledge has meaningfully improved how evenly aid is distributed, and Shohay is now working with similar community networks in other affected districts.',
      'Volunteers interested in supporting distribution logistics can register through the Volunteer page.'
    ],
    image: '/photo-1617494532674-67d22df2addb.jpg',
    publishedAt: '2024-07-13'
  },
  {
    id: '4',
    category: 'RESILIENCE',
    title: 'Local leaders coordinate post-flood recovery in Kurigram char areas',
    excerpt: 'Local leaders coordinate post-flood recovery in Kurigram char areas.',
    body: [
      'As floodwaters begin to recede in parts of Kurigram, local union council leaders are turning attention to recovery: assessing damaged homes, clearing debris from roads, and helping families who lost crops or livestock during the flood.',
      'Recovery in char areas is especially difficult — these low-lying river islands are among the first to flood and often the last to be reached by road once waters rise. Community leaders are working with Shohay-registered volunteers to prioritise which households need building materials or replacement livestock most urgently.',
      'Relief campaigns supporting recovery efforts in Kurigram are listed on the Campaigns page, with full transparency on how funds are used.'
    ],
    image: '/photo-1617494532490-297fc0eb515e.jpg',
    publishedAt: '2024-07-12'
  }
];

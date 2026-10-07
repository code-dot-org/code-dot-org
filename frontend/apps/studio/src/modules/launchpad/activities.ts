export const ACTIVITIES = [
  {
    id: 'pre-reader',
    title: 'Pre-Reader Express',
    description: 'Start coding with puzzles made for young learners.',
    ages: '4–7',
    kind: 'Course',
    url: 'https://studio.code.org/s/pre-express-2025',
    allowedPaths: ['/s/pre-express-2025', '/courses/pre-express-2025'],
  },
  {
    id: 'oceans',
    title: 'AI for Oceans',
    description: 'Teach AI to tell sea life from ocean rubbish.',
    ages: '7–11',
    kind: 'AI activity',
    url: 'https://studio.code.org/s/oceans',
    allowedPaths: ['/s/oceans', '/courses/oceans'],
  },
  {
    id: 'dance-ai',
    title: 'Dance Party: AI Edition',
    description: 'Explore AI and code a dance party with music and effects.',
    ages: '11–14',
    kind: 'Guided activity',
    url: 'https://studio.code.org/s/dance-ai-2023',
    allowedPaths: ['/s/dance-ai-2023', '/courses/dance-ai-2023'],
  },
  {
    id: 'minecraft',
    title: 'Minecraft Adventurer',
    description: 'Use blocks of code to explore a Minecraft world.',
    ages: '7–14',
    kind: 'Guided activity',
    url: 'https://studio.code.org/s/mc',
    allowedPaths: ['/s/mc', '/courses/mc'],
  },
  {
    id: 'music',
    title: 'Music Lab',
    description: 'Mix sounds, make a song, and start again whenever you like.',
    ages: '7–14',
    kind: 'Free play',
    url: 'https://studio.code.org/projects/music/new',
    allowedPaths: ['/projects/music'],
  },
];

export type Activity = (typeof ACTIVITIES)[number];

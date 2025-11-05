export interface ConditionalMessage {
  range: [number, number];
  message: string;
  icon?: string;
}

export interface PersonalizationInterstitial {
  id: string;
  afterQuestion: number;
  icon?: string;
  defaultMessage?: string;
  conditionalMessages?: ConditionalMessage[];
}

export const PERSONALIZATION_INTERSTITIALS: PersonalizationInterstitial[] = [
  {
    id: 'yearsTeaching',
    afterQuestion: 1,
    conditionalMessages: [
      {
        range: [0, 1],
        message:
          'Every expert was once a beginner. Your fresh perspective and willingness to learn are exactly what education needs!',
      },
      {
        range: [2, 2],
        message:
          'You’ve built your foundation and now you get to focus on the creative, exciting parts of teaching!',
      },
      {
        range: [3, 9],
        message:
          'You’ve found your rhythm! The perfect blend of experience and continued growth makes you an incredible educator.',
      },
      {
        range: [10, Infinity],
        message:
          'You’ve witnessed the evolution of technology firsthand and guide students with deep wisdom and expertise.',
      },
    ],
  },
  {
    id: 'confidence',
    afterQuestion: 2,
    conditionalMessages: [
      {
        range: [0, 3],
        message:
          'You’re exactly where many of the best computer science teachers started! Your willingness to learn will make you incredibly relatable to students who are struggling.',
      },
      {
        range: [4, 7],
        message:
          'You’ve got solid foundations and are building expertise every day. This sweet spot of knowledge plus humility makes you the kind of teacher students trust and learn from.',
      },
      {
        range: [8, 10],
        message:
          'Your deep technical knowledge is a huge asset! You can guide students through complex concepts and show them what’s possible in the world of programming.',
      },
    ],
  },
  {
    id: 'goals',
    icon: 'target',
    afterQuestion: 3,
    defaultMessage:
      'Having clear goals is half the battle. You’re setting yourself up for an amazing year!',
  },
  {
    id: 'classroomVision',
    icon: 'users',
    afterQuestion: 4,
    defaultMessage:
      'Your thoughtful approach to classroom culture will help every student feel like they belong in computer science!',
  },
  {
    id: 'support',
    icon: 'lightbulb',
    afterQuestion: 5,
    defaultMessage:
      'Understanding your preferred learning style means you’ll get the most out of every learning opportunity!',
  },
  {
    id: 'challenge',
    icon: 'robot',
    afterQuestion: 6,
    defaultMessage:
      'Compiling your answers to add to AI Teaching Assistant’s system prompt...',
  },
];

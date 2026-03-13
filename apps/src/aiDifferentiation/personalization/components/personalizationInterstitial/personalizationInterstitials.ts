import bulb from './../../images/bulb.svg';
import drums from './../../images/drum.svg';
import partyHorn from './../../images/party-horn.svg';
import seed from './../../images/seeding.svg';
import users from './../../images/users.svg';
export interface ConditionalMessage {
  range: [number, number];
  message: string;
  icon?: string;
}

export interface PersonalizationInterstitial {
  id: string;
  icon?: string;
  defaultMessage?: string;
  conditionalMessages?: ConditionalMessage[];
}

export const PERSONALIZATION_INTERSTITIALS: PersonalizationInterstitial[] = [
  {
    id: 'yearsTeaching',
    icon: drums,
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
    icon: seed,
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
    icon: partyHorn,
    defaultMessage:
      'Having clear goals is half the battle. You’re setting yourself up for an amazing year!',
  },
  {
    id: 'classroomVision',
    icon: users,
    defaultMessage:
      'Your thoughtful approach to classroom culture will help every student feel like they belong in computer science!',
  },
  {
    id: 'support',
    icon: bulb,
    defaultMessage:
      'Understanding your preferred learning style means you’ll get the most out of every learning opportunity!',
  },
  {
    id: 'challenge',
    defaultMessage:
      'Compiling your answers to add to AI Teaching Assistant’s system prompt...',
  },
];

export const getInterstitialMessage = (
  interstitialId: string,
  answerValue?: number
): string | undefined => {
  const interstitial = PERSONALIZATION_INTERSTITIALS.find(
    i => i.id === interstitialId
  );

  if (!interstitial) return undefined;

  if (interstitial.conditionalMessages && typeof answerValue === 'number') {
    const matched = interstitial.conditionalMessages.find(
      ({range}) => answerValue >= range[0] && answerValue <= range[1]
    );
    if (matched) return matched.message;
  }

  return interstitial.defaultMessage;
};

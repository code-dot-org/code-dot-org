export const YEARS_TEACHING_PROMPT = {
  order: 1,
  question: 'How many years have you been teaching?',
  subhead:
    'Code.org has tools and resources for teachers at every stage of their teaching journey.',
  type: 'short_answer',
  choices: [],
};

export const CONFIDENCE_PROMPT = {
  order: 2,
  question: 'How confident are you in teaching programming concepts?',
  subhead:
    'No matter your level of experience, Code.org can help you teach computer science.',
  type: 'single_choice',
};

export const TEACHER_GOAL_PROMPT = {
  order: 3,
  question:
    "What goals do you have for your own teaching practice while using Code.org's curriculum this year?",
  subhead: 'Code.org’s teacher tools are designed to help you achieve them.',
  type: 'multi_select',
};

export const CLASSROOM_VISION_PROMPT = {
  order: 4,
  question:
    'What do you want your classroom to look like, feel like, sound like?',
  subhead:
    'Code.org’s flexible course offerings offer a perfect fit for every classroom.',
  type: 'free_response',
};

export const SUPPORT_PREFERENCES_PROMPT = {
  order: 5,
  question: 'What kind of support is most helpful to you?',
  subhead:
    'Code.org offers tools and resources to support professional learning for every educator.',
  type: 'multi_select',
};

export const CHALLENGE_PROMPT = {
  order: 6,
  question:
    'What’s the biggest challenge you anticipate while teaching computer science this year?',
  subhead:
    'Code.org offers resources, training, and a teacher community to support you through any challenge.',
  type: 'free_response',
};

export const PERSONALIZATION_PROMPTS = [
  YEARS_TEACHING_PROMPT,
  CONFIDENCE_PROMPT,
  TEACHER_GOAL_PROMPT,
  CLASSROOM_VISION_PROMPT,
  SUPPORT_PREFERENCES_PROMPT,
  CHALLENGE_PROMPT,
];

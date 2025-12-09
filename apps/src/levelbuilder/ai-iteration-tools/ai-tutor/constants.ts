// Endpoint constants.
export const AI_TUTOR_ENDPOINT = 'ai-tutor';
export const LLM_GUARD_ENDPOINT = 'llm-guard';

export const availableEndpoints = [
  {
    id: AI_TUTOR_ENDPOINT,
    name: 'AI Tutor + Webpurify',
  },
];

// Temperature set as default during model customization when Gen Ai levels are created.
export const DEFAULT_TEMPERATURE = 0.8;

// Dummy data to appease the model card info type requirements in the real tool.
export const modelCardInfo = {
  botName: 'Mistral',
  description: 'Mistral Model',
  intendedUse: 'General AI',
  limitationsAndWarnings: 'None',
  testingAndEvaluation: 'None',
  exampleTopics: [],
  isPublished: false,
};

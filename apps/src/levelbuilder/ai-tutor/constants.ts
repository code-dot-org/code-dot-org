import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// Non-Gen AI endpoint constants
export const AI_TUTOR_ENDPOINT = 'ai-tutor';
export const LLM_GUARD_ENDPOINT = 'llm-guard';

const endpoints = [
  {
    id: AI_TUTOR_ENDPOINT,
    name: 'AI Tutor + Webpurify',
  },
  {
    id: LLM_GUARD_ENDPOINT,
    name: 'LLM Guard',
  },
];

const genAIEndpoints = [
  {
    id: AiChatModelIds.MISTRAL,
    name: 'Mistral Base + Webpurify',
  },
  {
    id: AiChatModelIds.ARITHMO,
    name: 'Mistral Arithmo + Webpurify',
  },
  {
    id: AiChatModelIds.BIOMISTRAL,
    name: 'Mistral Biomistral + Webpurify',
  },
  {
    id: AiChatModelIds.KAREN,
    name: 'Mistral Karen + Webpurify',
  },
  {
    id: AiChatModelIds.PIRATE,
    name: 'Mistral Pirate + Webpurify',
  },
];

export const genAIEndpointIds = genAIEndpoints.map(endpoint => endpoint.id);

export const availableEndpoints = endpoints.concat(genAIEndpoints);

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

// Non-Gen AI endpoint constants
const AI_TUTOR_ENDPOINT = 'ai-tutor';
const LLM_GUARD_ENDPOINT = 'llm-guard';

// Gen AI endpoint constants
const GEN_AI_MISTRAL_BASE = 'gen-ai-mistral-7b-inst-v01';
const GEN_AI_ARITHMO = 'gen-ai-arithmo2-mistral-7b';
const GEN_AI_BIOMISTRAL = 'gen-ai-biomistral-7b';
const GEN_AI_KAREN_CREATIVE = 'gen-ai-karen-creative-mistral-7b';
const GEN_AI_PIRATE = 'gen-ai-mistral-pirate-7b';

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
    id: GEN_AI_MISTRAL_BASE,
    name: 'Mistral Base + Webpurify',
  },
  {
    id: GEN_AI_ARITHMO,
    name: 'Mistral Arithmo + Webpurify',
  },
  {
    id: GEN_AI_BIOMISTRAL,
    name: 'Mistral Biomistral + Webpurify',
  },
  {
    id: GEN_AI_KAREN_CREATIVE,
    name: 'Mistral Karen + Webpurify',
  },
  {
    id: GEN_AI_PIRATE,
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

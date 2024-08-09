const endpoints = [
  {
    id: 'ai-tutor',
    name: 'AI Tutor + Webpurify',
  },
  {
    id: 'llm-guard',
    name: 'LLM Guard',
  },
];

const genAIEndpoints = [
  {
    id: 'gen-ai-mistral-7b-inst-v01',
    name: 'Mistral Base + Webpurify',
  },
  {
    id: 'gen-ai-arithmo2-mistral-7b',
    name: 'Mistral Arithmo + Webpurify',
  },
  {
    id: 'gen-ai-biomistral-7b',
    name: 'Mistral Biomistral + Webpurify',
  },
  {
    id: 'gen-ai-karen-creative-mistral-7b',
    name: 'Mistral Karen + Webpurify',
  },
  {
    id: 'gen-ai-mistral-pirate-7b',
    name: 'Mistral Pirate + Webpurify',
  },
];

export const genAIEndpointIds = genAIEndpoints.map(endpoint => endpoint.id);

export const availableEndpoints = endpoints.concat(genAIEndpoints);

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

import {JsonObjectSchema} from '@cdo/apps/aichat/types';

// Shared JSON schema property definitions for lab AI tutor answer schemas.
// Lab-specific properties (answerType enum, assumptions description, code
// description, pseudocode description) remain in each lab's helper.

export const GOAL_PROPERTY = {
  type: 'string' as const,
  description: 'What we are achieving this turn, limit to 1 line of text',
};

export const EXPLANATION_PROPERTY = {
  type: 'string' as const,
  description:
    "1 paragraph or less explanation of the code or plain-text answer to the student's question. Use markdown.",
};

export const NEXT_STEPS_PROPERTY = {
  type: 'string' as const,
  description:
    '1-2 concrete action(s) for student to achieve goal. Format as markdown bullets',
};

export const QUESTIONS_PROPERTY = {
  type: 'string' as const,
  description:
    'short list to confirm ambiguous details. Format as markdown bullets.',
};

export const EXAMPLE_PROPERTY = {
  type: 'string' as const,
  description:
    "1-2 concrete example(s) of the code or plain-text answer(s) to the student's question. Use markdown.",
};

export const VIDEO_URL_PROPERTY = {
  type: 'string' as const,
  description:
    'Optional. URL of a single tutorial video to share with the student, copied exactly from the available videos list. Omit if no video is relevant.',
};

export const CODE_ITEM_SCHEMA: JsonObjectSchema = {
  type: 'object',
  properties: {
    sourceCode: {type: 'string'},
    filename: {type: 'string'},
  },
  required: ['sourceCode', 'filename'],
  additionalProperties: false,
};

export const ANSWER_JSON_SCHEMA_REQUIRED: string[] = [
  'answerType',
  'nextSteps',
  'code',
  'explanation',
  'goal',
];

export const ANSWER_JSON_SCHEMA_PROPERTY_ORDERING: string[] = [
  'answerType',
  'goal',
  'assumptions',
  'code',
  'explanation',
  'pseudocode',
  'example',
  'nextSteps',
  'questions',
  'videoUrl',
];

const formatSection = (title: string, content?: string): string => {
  return content ? `**${title}**\n\n${content}\n\n` : '';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatCopyPasteResponse = (response: any): string => {
  let formattedResponse = '';
  formattedResponse += formatSection('Assumptions', response.assumptions);

  if (response.code && response.code.length > 0) {
    formattedResponse += `**Code**\n\n`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.code.forEach((code: any) => {
      formattedResponse += `\`${code.filename}\`\n\`\`\`\n${code.sourceCode}\n\`\`\`\n\n`;
    });
  }

  formattedResponse += formatSection('Explanation', response.explanation);
  formattedResponse += formatSection('Pseudocode', response.pseudocode);
  formattedResponse += formatSection('Example', response.example);
  formattedResponse += formatSection('Next Steps', response.nextSteps);
  formattedResponse += formatSection('Questions', response.questions);
  if (response.videoUrl) {
    formattedResponse += `\n[Watch this video](${response.videoUrl})\n`;
  }

  return formattedResponse;
};

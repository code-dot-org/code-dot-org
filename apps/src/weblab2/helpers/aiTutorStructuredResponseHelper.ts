import {JsonObjectSchema} from '@cdo/apps/aichat/types';

const getAnswerJsonSchema = (isCopyCodeMode: boolean): JsonObjectSchema => {
  return {
    type: 'object',
    properties: {
      tutorMode: {
        type: 'string',
        enum: [
          'Build HTML',
          'Build CSS',
          'Ask',
          'Hint',
          'Debug',
          'Explain',
          'Refuse',
        ],
      },
      goal: {
        type: 'string',
        description: 'What we are achieving this turn, limit to 1 line of text',
      },
      assumptions: {
        type: 'string',
        description:
          'Explicit design choices you made from the wireframe. Format as bullets.',
      },
      code: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            language: {type: 'string'},
            sourceCode: {
              type: 'string',
            },
            filename: {type: 'string'},
          },
          required: ['language', 'sourceCode', 'filename'],
          additionalProperties: false,
        },
        description:
          '`html` and/or `css` fences. When providing modifications to student code, provide the entire contents of the file. The list can be empty.',
      },
      explanation: {
        type: 'string',
        description:
          "1 paragraph or less explanation of the code or plain-text answer to the student's question. Use markdown.",
      },
      nextSteps: {
        type: 'string',
        description:
          '1-2 concrete action(s) for student to achieve goal. Format as markdown bullets',
      },
      furtherSupport: {
        type: 'string',
        description:
          '1–2 questions or 1–2 micro-hints. Format as markdown bullets.',
      },
      questions: {
        type: 'string',
        description:
          'short list to confirm ambiguous details. Format as markdown bullets.',
      },
    },
    required: [
      'tutorMode',
      'goal',
      'nextSteps',
      'furtherSupport',
      'code',
      'explanation',
    ],
    propertyOrdering: [
      'tutorMode',
      'goal',
      'assumptions',
      'code',
      'explanation',
      'nextSteps',
      'furtherSupport',
      'questions',
    ],
    additionalProperties: false,
  };
};

export const copyCodeJsonSchema: JsonObjectSchema = {
  type: 'object',
  properties: {
    answer: getAnswerJsonSchema(true),
  },
  required: ['answer'],
  additionalProperties: false,
};

export const acceptRejectJsonSchema: JsonObjectSchema = {
  type: 'object',
  properties: {
    code: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          language: {type: 'string'},
          sourceCode: {type: 'string'},
          filename: {type: 'string'},
        },
        required: ['language', 'sourceCode', 'filename'],
        additionalProperties: false,
      },
    },
    explanation: {type: 'string'},
  },
  required: ['code', 'explanation'],
  additionalProperties: false,
};

// Parsed json comes in as 'any'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatExplanationResponse = (response: any): string => {
  let formattedResponse = '';
  if (response.goal) {
    formattedResponse += `**Goal**\n\n${response.goal}\n\n`;
  }
  if (response.assumptions) {
    formattedResponse += `**Assumptions**\n\n${response.assumptions}\n\n`;
  }
  if (response.code && response.code.length > 0) {
    formattedResponse += `**Code**\n\n`;
    // Parsed json comes in as 'any'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.code.forEach((code: any) => {
      formattedResponse += `\`${code.filename}\`\n\`\`\`\n${code.sourceCode}\n\`\`\`\n\n`;
    });
  }
  if (response.explanation) {
    formattedResponse += `**Explanation**\n\n${response.explanation}\n\n`;
  }
  if (response.nextSteps) {
    formattedResponse += `**Next Steps**\n\n${response.nextSteps}\n\n`;
  }
  if (response.furtherSupport) {
    formattedResponse += `**Further Support**\n\n${response.furtherSupport}\n\n`;
  }
  if (response.questions) {
    formattedResponse += `**Questions**\n\n${response.questions}\n\n`;
  }
  return formattedResponse;
};

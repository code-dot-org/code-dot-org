import {JsonObjectSchema} from '@cdo/apps/aichat/types';

const getExplanationJsonSchema = (
  isCopyCodeMode: boolean
): JsonObjectSchema => {
  return {
    type: 'object',
    properties: {
      tutorMode: {type: 'string', enum: ['Build HTML', 'Build CSS']},
      goal: {
        type: 'string',
        description: 'What we are achieving this turn, limit to 1 line of text',
      },
      assumptions: {
        type: 'string',
        description: 'Explicit design choices you made from the wireframe',
      },
      nextSteps: {
        type: 'string',
        description:
          '1-2 bullets of concrete action(s) for student to achieve goal.',
      },
      furtherSupport: {
        type: 'string',
        description: '1–2 questions or 1–2 micro-hints',
      },
      questions: {
        type: 'string',
        description: 'short list to confirm ambiguous details',
      },
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
          description: isCopyCodeMode
            ? 'Runnable `html` and/or `css` fences'
            : 'Runnable html or css code snippets. These should not be full code files.',
        },
      },
    },
    required: ['tutorMode', 'goal', 'nextSteps', 'furtherSupport'],
    additionalProperties: false,
    description:
      "Answer to the student's question. All string responses should be formatted in markdown.",
  };
};

export const copyCodeJsonSchema: JsonObjectSchema = {
  type: 'object',
  properties: {
    explanation: getExplanationJsonSchema(true),
  },
  required: ['explanation'],
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatExplanationResponse = (response: any): string => {
  let formattedResponse = '';
  if (response.goal) {
    formattedResponse += `**Goal**\n\n${response.goal}\n\n`;
  }
  if (response.assumptions) {
    formattedResponse += `**Assumptions**\n\n${response.assumptions}\n\n`;
  }
  if (response.code) {
    formattedResponse += `**Code**\n\n`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.code.forEach((code: any) => {
      formattedResponse += `Filename: ${code.filename}\n\`\`\`${code.sourceCode}\n\`\`\`\n\n`;
    });
  }
  if (response.nextSteps) {
    formattedResponse += `**Next Steps**\n${response.nextSteps}\n\n`;
  }
  if (response.furtherSupport) {
    formattedResponse += `**Further Support**\n\n${response.furtherSupport}\n\n`;
  }
  if (response.questions) {
    formattedResponse += `**Questions**\n\n${response.questions}\n\n`;
  }
  return formattedResponse;
};

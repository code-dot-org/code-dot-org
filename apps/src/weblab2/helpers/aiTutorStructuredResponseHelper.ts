import {JsonObjectSchema} from '@cdo/apps/aichat/types';

const getAnswerJsonSchema = (): JsonObjectSchema => {
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
          'Explain Code',
          'Example',
          'Pseudocode',
          'Documentation',
          'Refusal',
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
          '`html`, `css`, or `js` fences. Limit to one language (html, css, or js) across the entire list. When providing modifications to student code, provide the entire contents of the file. The list can be empty. Code should be formatted with appropriate newlines and indentation. The student will need to copy and paste this code into their project.',
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
      questions: {
        type: 'string',
        description:
          'short list to confirm ambiguous details. Format as markdown bullets.',
      },
    },
    // We return tutorMode and goal but do not show them to the student.
    // These are used to help guide the AI's response.
    required: ['tutorMode', 'nextSteps', 'code', 'explanation', 'goal'],
    propertyOrdering: [
      'tutorMode',
      'goal',
      'assumptions',
      'code',
      'explanation',
      'nextSteps',
      'questions',
    ],
    additionalProperties: false,
  };
};

export const copyCodeJsonSchema: JsonObjectSchema = {
  type: 'object',
  properties: {
    answer: getAnswerJsonSchema(),
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

// Parsed json comes in as 'any', but it follows the structure defined in getAnswerJsonSchema().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatExplanationResponse = (response: any): string => {
  let formattedResponse = '';
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
  if (response.questions) {
    formattedResponse += `**Questions**\n\n${response.questions}\n\n`;
  }
  return formattedResponse;
};

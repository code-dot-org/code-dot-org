import {JsonObjectSchema} from '@cdo/apps/aichat/types';
import {AI_TUTOR_ANSWER_TYPES} from '@cdo/apps/pythonlab/types';

const getAnswerJsonSchema = (): JsonObjectSchema => {
  return {
    type: 'object',
    properties: {
      answerType: {
        type: 'string',
        enum: [...AI_TUTOR_ANSWER_TYPES],
      },
      goal: {
        type: 'string',
        description: 'What we are achieving this turn, limit to 1 line of text',
      },
      assumptions: {
        type: 'string',
        description: 'Explicit design choices you made. Format as bullets.',
      },
      code: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sourceCode: {
              type: 'string',
            },
            filename: {type: 'string'},
          },
          required: ['sourceCode', 'filename'],
          additionalProperties: false,
        },
        description:
          '`text`, `python`, `csv`, or `json` fences. Limit to one language (text, python, csv, or json) across the entire list. ' +
          'The list can be empty. Code should be formatted with appropriate newlines and indentation. ' +
          'When providing modifications to a file in the student code, provide the entire contents of the file. ' +
          'Code should be formatted with appropriate newlines and indentation.',
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
      pseudocode: {
        type: 'string',
        description:
          'Pseudocode in plain English only (no Python). Wrap the pseudocode in a markdown fenced code block with language tag `text` so newlines and indentation are preserved. Use markdown outside the block only if needed.',
      },
      example: {
        type: 'string',
        description:
          "1-2 concrete example(s) of the code or plain-text answer(s) to the student's question. Use markdown.",
      },
      videoUrl: {
        type: 'string',
        description:
          'Optional. URL of a single tutorial video to share with the student, copied exactly from the available videos list. Omit if no video is relevant.',
      },
    },
    // We return answerType and goal but do not show them to the student.
    // These are used to help guide the AI's response.
    required: ['answerType', 'nextSteps', 'code', 'explanation', 'goal'],
    propertyOrdering: [
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
    ],
    additionalProperties: false,
  };
};

export const aiTutorResponseJsonSchema: JsonObjectSchema = {
  type: 'object',
  properties: {
    answer: getAnswerJsonSchema(),
  },
  required: ['answer'],
  additionalProperties: false,
};

/**
 * Helper function to format a section with a title and optional content.
 * Returns an empty string if content is not provided.
 */
const formatSection = (title: string, content?: string): string => {
  return content ? `**${title}**\n\n${content}\n\n` : '';
};

// This is used when the AI Tutor response's answerType is not 'buildPython', 'buildCSV', nor 'buildJSON'.
// Parsed json comes in as 'any', but it follows the structure defined in getAnswerJsonSchema().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatCopyPasteResponse = (response: any): string => {
  let formattedResponse = '';
  formattedResponse += formatSection('Assumptions', response.assumptions);

  if (response.code && response.code.length > 0) {
    formattedResponse += `**Code**\n\n`;
    // Parsed json comes in as 'any'
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

import {JsonObjectSchema} from '@cdo/apps/aichat/types';
import {
  ANSWER_JSON_SCHEMA_PROPERTY_ORDERING,
  ANSWER_JSON_SCHEMA_REQUIRED,
  CODE_ITEM_SCHEMA,
  EXAMPLE_PROPERTY,
  EXPLANATION_PROPERTY,
  GOAL_PROPERTY,
  NEXT_STEPS_PROPERTY,
  QUESTIONS_PROPERTY,
  VIDEO_URL_PROPERTY,
} from '@cdo/apps/aiTutor/helpers/aiTutorResponseHelpers';
import {AI_TUTOR_ANSWER_TYPES} from '@cdo/apps/pythonlab/types';

const getAnswerJsonSchema = (): JsonObjectSchema => {
  return {
    type: 'object',
    properties: {
      answerType: {
        type: 'string',
        enum: [...AI_TUTOR_ANSWER_TYPES],
      },
      goal: GOAL_PROPERTY,
      assumptions: {
        type: 'string',
        description: 'Explicit design choices you made. Format as bullets.',
      },
      code: {
        type: 'array',
        items: CODE_ITEM_SCHEMA,
        description:
          '`text`, `python`, `csv`, or `json` fences. Limit to one language (text, python, csv, or json) across the entire list. ' +
          'The list can be empty. Code should be formatted with appropriate newlines and indentation. ' +
          'When providing modifications to a file in the student code, provide the entire contents of the file. ' +
          'Code should be formatted with appropriate newlines and indentation.',
      },
      explanation: EXPLANATION_PROPERTY,
      nextSteps: NEXT_STEPS_PROPERTY,
      questions: QUESTIONS_PROPERTY,
      pseudocode: {
        type: 'string',
        description:
          'Pseudocode in plain English only (no Python). Wrap the pseudocode in a markdown fenced code block with language tag `text` so newlines and indentation are preserved. Use markdown outside the block only if needed.',
      },
      example: EXAMPLE_PROPERTY,
      videoUrl: VIDEO_URL_PROPERTY,
    },
    // We return answerType and goal but do not show them to the student.
    // These are used to help guide the AI's response.
    required: ANSWER_JSON_SCHEMA_REQUIRED,
    propertyOrdering: ANSWER_JSON_SCHEMA_PROPERTY_ORDERING,
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

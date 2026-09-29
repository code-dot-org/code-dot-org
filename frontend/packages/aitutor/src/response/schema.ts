// The shape an answer is required to take, when a session wants one.
//
// Ported from `apps/src/aiTutor/helpers/aiTutorResponseHelpers.ts`, which is
// already the SHARED half of this: the legacy splits the schema between
// properties every lab's tutor uses (here) and the parts each lab decides for
// itself — the `answerType` enum, and how it describes its own code (there,
// in `weblab2/helpers/aiTutorStructuredResponseHelper.ts`). That split is the
// right one and it survives the port: `answerSchema` takes the lab's half as
// arguments.
//
// The descriptions ARE the interface. They are what the model reads, they have
// been tuned against its behaviour, and they are quoted here verbatim for the
// reason the context string is (`context/hiddenContext`).

/** A JSON Schema fragment. Deliberately loose — this is a document, not a type. */
export type JsonSchema = Record<string, unknown>;

export const GOAL_PROPERTY: JsonSchema = {
  type: 'string',
  description: 'What we are achieving this turn, limit to 1 line of text',
};

export const EXPLANATION_PROPERTY: JsonSchema = {
  type: 'string',
  description:
    "1 paragraph or less explanation of the code or plain-text answer to the student's question. Use markdown.",
};

export const NEXT_STEPS_PROPERTY: JsonSchema = {
  type: 'string',
  description:
    '1-2 concrete action(s) for student to achieve goal. Format as markdown bullets',
};

export const QUESTIONS_PROPERTY: JsonSchema = {
  type: 'string',
  description:
    'short list to confirm ambiguous details. Format as markdown bullets.',
};

export const EXAMPLE_PROPERTY: JsonSchema = {
  type: 'string',
  description:
    "1-2 concrete example(s) of the code or plain-text answer(s) to the student's question. Use markdown.",
};

export const VIDEO_URL_PROPERTY: JsonSchema = {
  type: 'string',
  description:
    'Optional. URL of a single tutorial video to share with the student, copied exactly from the available videos list. Omit if no video is relevant.',
};

/** One file the model is handing back, whole. */
export const CODE_ITEM_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    sourceCode: {type: 'string'},
    filename: {type: 'string'},
  },
  required: ['sourceCode', 'filename'],
  additionalProperties: false,
};

/**
 * What the model must always return.
 *
 * `answerType` and `goal` are required and NOT SHOWN to the student. They are
 * there to make the model commit to what kind of answer it is giving before it
 * gives it, which is also what makes the accept/reject routing possible: the
 * decision is read off a declared field rather than guessed from the prose.
 */
export const ANSWER_REQUIRED: string[] = [
  'answerType',
  'nextSteps',
  'code',
  'explanation',
  'goal',
];

export const ANSWER_PROPERTY_ORDERING: string[] = [
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

export interface AnswerSchemaOptions {
  /** The kinds of answer this lab's tutor may give. */
  answerTypes: readonly string[];
  /** How this lab describes the files it wants back. */
  codeDescription: string;
  /** How this lab wants pseudocode written, if it asks for any. */
  pseudocodeDescription?: string;
  /** How this lab wants stated assumptions, if it asks for any. */
  assumptionsDescription?: string;
}

/**
 * The whole schema, given the lab's half of it.
 *
 * Wrapped in a one-property `answer` object, as the legacy is. The wrapper
 * exists because the provider is asked for an object and this keeps the answer
 * a single named thing rather than a bag at the top level.
 */
export const answerSchema = (options: AnswerSchemaOptions): JsonSchema => ({
  type: 'object',
  properties: {
    answer: {
      type: 'object',
      properties: {
        answerType: {type: 'string', enum: [...options.answerTypes]},
        goal: GOAL_PROPERTY,
        ...(options.assumptionsDescription
          ? {
              assumptions: {
                type: 'string',
                description: options.assumptionsDescription,
              },
            }
          : {}),
        code: {
          type: 'array',
          items: CODE_ITEM_SCHEMA,
          description: options.codeDescription,
        },
        explanation: EXPLANATION_PROPERTY,
        nextSteps: NEXT_STEPS_PROPERTY,
        questions: QUESTIONS_PROPERTY,
        ...(options.pseudocodeDescription
          ? {
              pseudocode: {
                type: 'string',
                description: options.pseudocodeDescription,
              },
            }
          : {}),
        example: EXAMPLE_PROPERTY,
        videoUrl: VIDEO_URL_PROPERTY,
      },
      required: ANSWER_REQUIRED,
      propertyOrdering: ANSWER_PROPERTY_ORDERING,
      additionalProperties: false,
    },
  },
  required: ['answer'],
  additionalProperties: false,
});

/** A file in an answer, as the model returns it. */
export interface AnswerCodeFile {
  filename: string;
  sourceCode: string;
}

/** An answer, parsed. Everything but `answerType` may be absent. */
export interface Answer {
  answerType: string;
  goal?: string;
  assumptions?: string;
  code?: AnswerCodeFile[];
  explanation?: string;
  pseudocode?: string;
  example?: string;
  nextSteps?: string;
  questions?: string;
  videoUrl?: string;
}

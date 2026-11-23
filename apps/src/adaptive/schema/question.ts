import {z} from 'zod';

import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

import {stepBaseSchema} from './steps/base';
import {subsetOf} from './subsetOf';

/**
 * What a question's answer says about one skill. A graded question, one with
 * `correctChoiceId`, measures `evidenceLevel` when answered correctly and
 * nothing otherwise; a survey question measures the evidence level listed
 * for the chosen choice. Evidence level 0 is no evidence.
 */
export const measuresSchema = z.union([
  z
    .strictObject({
      skillId: z
        .string()
        .min(1)
        .meta({title: 'Skill', widget: 'reference', options: 'skills.*'}),
      evidenceLevel: z.number().int().min(1).meta({
        title: 'Evidence level',
        description: 'What a correct answer shows.',
      }),
    })
    .meta({title: 'Graded: a correct answer shows one level'}),
  z
    .strictObject({
      skillId: z
        .string()
        .min(1)
        .meta({title: 'Skill', widget: 'reference', options: 'skills.*'}),
      /**
       * The evidence level each choice shows, by choice id. A choice left out
       * measures nothing.
       */
      evidenceLevels: z
        .record(z.string().min(1), z.number().int().min(0))
        .meta({
          title: 'Evidence levels',
          keyOptions: '../../choices.*.id',
          description:
            'The evidence level each choice shows, by choice id. A choice left out shows nothing.',
        }),
    })
    .meta({title: 'Survey: each choice shows a level'}),
]);

/** What a question's answer says about one skill. */
export type Measures = z.infer<typeof measuresSchema>;

/** The answer id of a typed answer to a multiple choice question that allows one. */
export const OTHER_CHOICE_ID = 'other';

/**
 * The slot of the checkpoint's plan template this question's answer fills.
 * Quoted to the prompts that build on the plan.
 */
const planSlotSchema = z.string().min(1).optional().meta({
  title: 'Plan slot',
  description: "The slot of the checkpoint's plan template this answer fills.",
});

/** A multiple choice question that does not rely on Quiz BE (but looks like a Quiz).
 * This should be used for diagnostics and surveys and Quiz backed levels (when implemented)
 * should be used for evaluation.
 */
export const multipleChoiceDiagnosticQuestionSchema = subsetOf<
  Omit<QuizQuestionSummary, 'page'> & {
    correctChoiceId?: string;
    measures?: Measures;
    allowOther?: {placeholder?: string};
    plan?: string;
  }
>()(
  z
    .strictObject({
      id: z.number().int().positive().meta({title: 'Id'}),
      type: z.literal('MultipleChoiceQuestion'),
      questionName: z.string().min(1).meta({title: 'Name'}),
      questionTitle: z.string().min(1).meta({title: 'Question'}),
      choices: z
        .array(
          z
            .strictObject({
              id: z.string().min(1).meta({title: 'Id'}),
              text: z.string().min(1).meta({title: 'Text'}),
            })
            .meta({title: 'Choice'})
        )
        .min(2)
        .meta({title: 'Choices'}),
      /**
       * When supplied, the student retries until correct.
       * Otherwise any option allows the student to continue.
       */
      correctChoiceId: z.string().min(1).optional().meta({
        title: 'Correct choice',
        widget: 'reference',
        options: '../choices.*.id',
        description:
          'When set, the student retries until correct. Otherwise any choice lets the student continue.',
      }),
      measures: measuresSchema.optional().meta({
        title: 'Measures',
        description: 'What the answer says about one skill.',
      }),
      /**
       * Offers a typed answer beside the choices, saved under the answer id
       * OTHER_CHOICE_ID with its text.
       */
      allowOther: z
        .strictObject({
          placeholder: z
            .string()
            .min(1)
            .optional()
            .meta({title: 'Placeholder'}),
        })
        .optional()
        .meta({
          title: 'Typed answer',
          description:
            'Offers a typed answer beside the choices, saved as the choice "other".',
        }),
      plan: planSlotSchema,
    })
    .meta({title: 'Multiple choice'})
);

export const freeResponseQuestionSchema = z
  .strictObject({
    id: z.number().int().positive().meta({title: 'Id'}),
    type: z.literal('freeResponse'),
    text: z.string().min(1).meta({title: 'Question'}),
    /** Shown above the text area. */
    descriptionText: z.string().min(1).optional().meta({
      title: 'Description',
      description: 'Shown above the text area.',
    }),
    placeholder: z.string().optional().meta({title: 'Placeholder'}),
    plan: planSlotSchema,
  })
  .meta({title: 'Free response'});

/** One of a questions step's questions. */
export const questionSchema = z.discriminatedUnion('type', [
  multipleChoiceDiagnosticQuestionSchema,
  freeResponseQuestionSchema,
]);

/** A questions step, played one question at a time in order. */
export const questionsStepSchema = stepBaseSchema
  .extend({
    kind: z.literal('questions'),
    description: z.string().optional().meta({title: 'Description'}),
    questions: z
      .array(questionSchema.meta({title: 'Question'}))
      .min(1)
      .meta({
        title: 'Questions',
        description: 'Played one at a time, in order.',
      }),
  })
  .meta({title: 'Questions'});

// A level's checklist, for any Lab2 lab: steps the student does before
// they can continue, each with markdown text and a check that says when it
// is done. The lab supplies its own kinds of check, as a zod union tagged
// by `kind`; everything else about a checklist is the same in every lab.

import {z, ZodType} from 'zod';

import '@cdo/apps/lab2/levelEditors/schemaForm/schemaMeta';

/** The widget name the checklist editor registers under in a schema form. */
export const CHECKLIST_WIDGET = 'checklist';

export function checklistSchema<Check extends ZodType>(check: Check) {
  const step = z.strictObject({
    text: z.string().min(1, 'Required.').meta({
      title: 'Text',
      widget: 'markdown',
      placeholder: 'Select **Run**.',
    }),
    check: check.meta({title: 'Done when'}),
    shownWhen: check.optional().meta({
      title: 'Hidden until',
      feature: 'Hide this step until something is done',
    }),
    id: z.string().optional().meta({
      title: 'Id',
      description: "Names the step to the lab's hover and click handling.",
    }),
  });
  return z
    .strictObject({
      title: z.string().optional().meta({title: 'Title', widget: 'markdown'}),
      steps: z
        .array(step.meta({title: 'Step'}))
        .optional()
        .meta({
          title: 'Steps',
          description:
            'The student continues once every step is done. With no steps they can continue from the start.',
        }),
      collapsedText: z.string().optional().meta({
        title: 'Collapsed text',
        description:
          'A short line that stays in view when the steps are collapsed.',
      }),
    })
    .meta({widget: CHECKLIST_WIDGET});
}

// The shape of a Sprite Lab in Lab2 level's configuration: one group for
// each surface the student sees. The lab's type, the checks on a saved
// value, and the levelbuilder form are all taken from this one description.
//
// This is a first slice of two groups, the Images tab and the World tab. A
// level stores it in its level_config property. A level that leaves a group
// out behaves as free play does on that surface.
//
// Each option's `title` and `description` are what a level author reads on
// the form.

import {z} from 'zod';

import {IMAGE_SOURCES} from '../ai/images/imageCache';
import {IMAGE_SUBJECTS, IMAGE_TYPES} from '../ai/images/types';

// A role is a name an image level records on the image it makes, such as
// "hero" or "treasure", so that later levels can refer to that image.
const roleName = z.string().trim().min(1);

const madeImageSchema = z
  .strictObject({
    type: z.enum(IMAGE_TYPES).meta({
      title: 'Type',
      description: 'The kind of image the student makes on this level.',
    }),
    subject: z.enum(IMAGE_SUBJECTS).optional().meta({
      title: 'Subject',
      description:
        'For a sprite: a character can be animated, an object is one still picture. Character when not set.',
    }),
    role: roleName.optional().meta({
      title: 'Role',
      description:
        'A name recorded on the image, such as "hero". Later levels use it to find this image.',
    }),
  })
  .superRefine((made, context) => {
    if (made.subject && made.type !== 'sprite') {
      context.addIssue({
        code: 'custom',
        path: ['subject'],
        message: 'Only a sprite has a subject.',
      });
    }
  });

const imagesSchema = z.strictObject({
  makes: madeImageSchema.optional().meta({
    title: 'The image this level makes',
    description: 'Leave empty on a level that is not about making an image.',
  }),
  onlyThisImage: z.boolean().optional().meta({
    title: 'Only this image',
    description:
      'The Images tab offers the one image this level makes, with no adding or deleting.',
  }),
  explainAi: z.boolean().optional().meta({
    title: 'Explain how AI made it',
    description:
      'After the first picture made in a visit, the level tells how AI made it.',
  }),
  source: z.enum(IMAGE_SOURCES).optional().meta({
    title: 'Picture source',
    description:
      'Cached pictures come from the published set, with the model filling gaps. Live asks the model every time. Cached when not set.',
  }),
});

const worldSchema = z.strictObject({
  paletteRoles: z.array(roleName).optional().meta({
    title: 'Palette roles',
    description:
      'The World palette offers the images in these roles. The first role is what the student places first.',
  }),
  startPattern: z.array(z.string()).optional().meta({
    title: 'Start pattern',
    description:
      'A premade world, one line for each row, the floor last. B is a block, S is the player, and a dot is empty.',
    widget: 'lines',
  }),
  startRoles: z.record(z.string().length(1), roleName).optional().meta({
    title: 'Start pattern roles',
    description:
      'More pattern letters, each standing for the newest sprite with a role, for example {"F": "friend"}.',
  }),
});

export const levelConfigSchema = z.strictObject({
  images: imagesSchema.optional().meta({title: 'Images tab'}),
  world: worldSchema.optional().meta({title: 'World tab'}),
});

export type LevelConfig = z.infer<typeof levelConfigSchema>;

/** One thing wrong with a saved value, and where: "images.makes.type". */
export interface ConfigProblem {
  path: string;
  message: string;
}

/**
 * Checks a saved value against the schema. A value with problems gives no
 * config, since half of a level's settings is worse than none.
 */
export function parseLevelConfig(value: unknown): {
  config?: LevelConfig;
  problems: ConfigProblem[];
} {
  const result = levelConfigSchema.safeParse(value ?? {});
  if (result.success) {
    return {config: result.data, problems: []};
  }
  return {
    problems: result.error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };
}

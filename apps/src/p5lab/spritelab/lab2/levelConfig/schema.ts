// A Sprite Lab in Lab2 level's settings, defined once. The lab's type and
// the check on a saved value both come from this description, and the
// levelbuilder form reads its titles and help text from it.
//
// A level stores its settings in the level_config property. The settings
// say what the level is about and what the student may change, in terms of
// a project's parts (its images, world and code), not in terms of the lab's
// screen. A level with no settings at all is free play.
//
// The checklist's steps, the callouts, the blocks added on arrival, the
// starter images and a scene's code keep the form their own modules define.
// They are checked here only for being present and of the right outer shape.

import {z} from 'zod';

import {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import type {AddBlockEntry} from '../addBlocks';
import {IMAGE_SOURCES} from '../ai/images/imageCache';
import {IMAGE_SUBJECTS, IMAGE_TYPES} from '../ai/images/types';
import type {LevelCallout} from '../callouts';
import type {Objective} from '../objectives';
import type {StarterImage} from '../types';

/** The parts of a project a student can change. */
export const PROJECT_PARTS = ['images', 'world', 'code'] as const;
export type ProjectPart = (typeof PROJECT_PARTS)[number];

/** What a level can be about: one of a project's parts, or playing. */
export const FOCUSES = [...PROJECT_PARTS, 'play'] as const;
export type Focus = (typeof FOCUSES)[number];

// A role is a name an image level records on the image it makes, such as
// "hero" or "treasure", so that later levels can refer to that image.
const roleName = z.string().trim().min(1);

const anObject = (value: unknown) =>
  !!value && typeof value === 'object' && !Array.isArray(value);

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
  makeFirst: z.boolean().optional().meta({
    title: 'Make the image first',
    description:
      'The level starts with making its image, then goes on to its focus.',
  }),
  onlyThisImage: z.boolean().optional().meta({
    title: 'Only this image',
    description:
      'The student sees the one image this level makes, with no adding or deleting.',
  }),
  canAdd: z.boolean().optional().meta({
    title: 'Can add images',
    description: 'Turn off to keep the student to the images they have.',
  }),
  canDelete: z.boolean().optional().meta({
    title: 'Can delete images',
    description:
      'Turn off when a later level depends on an image made earlier.',
  }),
  kinds: z.array(z.enum(IMAGE_TYPES)).optional().meta({
    title: 'Kinds listed',
    description:
      'The kinds of image the student sees. Every kind when not set.',
  }),
  paintTools: z.enum(['limited']).optional().meta({
    title: 'Paint tools',
    description:
      'Limited gives a fixed set of colors and one brush, for a level that is not about painting.',
  }),
  generationLimit: z.number().int().positive().optional().meta({
    title: 'Generation limit',
    description:
      'How many pictures the student can generate in one visit. No limit when not set.',
  }),
  explainAi: z.boolean().optional().meta({
    title: 'Explain how AI made it',
    description:
      'After the first picture made in a visit, the level tells how AI made it.',
  }),
  upload: z.boolean().optional().meta({
    title: 'Upload',
    description: 'The student can upload an image.',
  }),
  source: z.enum(IMAGE_SOURCES).optional().meta({
    title: 'Picture source',
    description:
      'Cached pictures come from the published set. Live asks the model, for levelbuilders only. Cached when not set.',
  }),
  starters: z.array(z.custom<StarterImage>(anObject)).optional().meta({
    title: 'Starter images',
    description:
      'Images the level gives the project on arrival, when it has none of that name or role.',
  }),
});

const worldSchema = z.strictObject({
  palette: z.array(roleName).optional().meta({
    title: 'Palette',
    description:
      'The roles of the images the student can place. The level’s own image when not set.',
  }),
  keepsOneOf: z.array(roleName).optional().meta({
    title: 'Keeps at least one of',
    description:
      'For each of these roles, the last square showing it cannot be erased until another is placed.',
  }),
});

const sceneSchema = z.strictObject({
  id: z.string().min(1).meta({
    title: 'Id',
    description:
      'What the go to scene block stores. "scene-1" is the scene every project starts with.',
  }),
  name: z.string().min(1).meta({
    title: 'Name',
    description: 'What the student sees, when the level creates the scene.',
  }),
  code: z.custom<WorkspaceSerialization>(anObject).optional().meta({
    title: 'Code',
    description: 'The scene’s code when the level creates it.',
  }),
  world: z
    .strictObject({
      pattern: z.array(z.string()).meta({
        title: 'Pattern',
        description:
          'A premade world, one line for each row, the floor last. B is a block, S is the player, and a dot is empty.',
      }),
      roles: z.record(z.string().length(1), roleName).optional().meta({
        title: 'Pattern roles',
        description:
          'More pattern letters, each standing for the newest sprite with a role, for example {"F": "friend"}.',
      }),
    })
    .optional()
    .meta({title: 'Premade world'}),
  editable: z.boolean().optional().meta({
    title: 'Editable',
    description:
      'For a scene after the first: the student can open it in the editor.',
  }),
});

const scenesSchema = z
  .strictObject({
    starting: z.array(sceneSchema).max(2).optional().meta({
      title: 'Starting scenes',
      description:
        'Scenes the level makes sure the project has. The first is the one the level opens, and the student is kept to these.',
    }),
    canChange: z.boolean().optional().meta({
      title: 'Student can change scenes',
      description:
        'The student can add, rename, reorder and delete scenes. On in free play, off elsewhere, when not set.',
    }),
  })
  .superRefine((scenes, context) => {
    if (scenes.canChange && scenes.starting?.length) {
      context.addIssue({
        code: 'custom',
        path: ['canChange'],
        message:
          'A level with starting scenes keeps the student to them, so it cannot also let them change scenes.',
      });
    }
    if (scenes.starting?.[0]?.editable !== undefined) {
      context.addIssue({
        code: 'custom',
        path: ['starting', 0, 'editable'],
        message: 'The first scene is always the one the student edits.',
      });
    }
  });

const blocksSchema = z.strictObject({
  addOnArrival: z.array(z.custom<AddBlockEntry>(anObject)).optional().meta({
    title: 'Blocks added on arrival',
    description:
      'Blocks the level adds to the first scene when the student arrives.',
  }),
  lockEarlier: z.boolean().optional().meta({
    title: 'Lock earlier blocks',
    description: 'Blocks built on earlier levels cannot be deleted here.',
  }),
  catalog: z.boolean().optional().meta({
    title: 'Block catalog',
    description:
      'New blocks start out of the toolbox, and the student adds them from Discover blocks.',
  }),
  dropdownsStartOn: z
    .record(z.string(), z.union([roleName, z.array(roleName)]))
    .optional()
    .meta({
      title: 'Dropdowns start on',
      description:
        'The role each image dropdown starts on, by image kind or by block type.',
    }),
});

const guideSchema = z.strictObject({
  title: z.string().optional().meta({
    title: 'Title',
    description: 'Markdown, shown above the steps.',
  }),
  steps: z.array(z.custom<Objective>(anObject)).optional().meta({
    title: 'Steps',
    description:
      'The checklist. With no steps the student can continue from the start.',
  }),
  collapsedText: z.string().optional().meta({
    title: 'Collapsed text',
    description: 'A short line the collapsed guide keeps.',
  }),
  callouts: z.array(z.custom<LevelCallout>(anObject)).optional().meta({
    title: 'Callouts',
    description: 'Arrows that point the student at the next thing to open.',
  }),
  freePlayIntro: z.boolean().optional().meta({
    title: 'Free play intro',
    description: 'The intro opens the first time the student arrives.',
  }),
});

export const levelConfigSchema = z
  .strictObject({
    focus: z.enum(FOCUSES).optional().meta({
      title: 'Focus',
      description: 'What the level is about. The lab opens there.',
    }),
    edits: z.array(z.enum(PROJECT_PARTS)).optional().meta({
      title: 'Edits',
      description:
        'The parts of the project the student can change. Every part when not set, which is free play.',
    }),
    images: imagesSchema.optional().meta({title: 'Images'}),
    world: worldSchema.optional().meta({title: 'World'}),
    scenes: scenesSchema.optional().meta({title: 'Scenes'}),
    blocks: blocksSchema.optional().meta({title: 'Blocks'}),
    guide: guideSchema.optional().meta({title: 'Guide'}),
  })
  .superRefine((config, context) => {
    const {focus, edits} = config;
    if (focus && !edits) {
      context.addIssue({
        code: 'custom',
        path: ['edits'],
        message: 'A level with a focus says what the student can change.',
      });
    }
    if (edits && !focus) {
      context.addIssue({
        code: 'custom',
        path: ['focus'],
        message: 'A level that limits what the student can change has a focus.',
      });
    }
    if (focus && focus !== 'play' && edits && !edits.includes(focus)) {
      context.addIssue({
        code: 'custom',
        path: ['edits'],
        message: `The level's focus, ${focus}, is something the student can change.`,
      });
    }
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

// A Sprite Lab in Lab2 level's settings (the level_config property),
// defined once. The lab's type, the check on a saved value and the
// levelbuilder form all come from this description.
//
// A level that sets nothing is plain Sprite Lab: a Code tab and the game.
// Every other feature is a group the level adds when it wants that
// feature, and the group's settings only exist inside it. A level that
// adds `world` gets the World tab, and only then has a World palette to
// set.
//
// This module is loaded by the levelbuilder page as well as the lab, so it
// imports types only.

import {z} from 'zod';

import type {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import type {AddBlock} from '../addBlocks';
import type {ImageSource} from '../ai/images/imageCache';
import type {ImageSubject, ImageType} from '../ai/images/types';
import type {CalloutTarget} from '../callouts';
import type {ObjectiveCheck} from '../objectives';
import type {Tab} from '../redux/spriteLab2Redux';
import type {CalloutDirection} from '../views/components/Callout';

/**
 * What the form reads from a schema node, beyond zod's own `title` and
 * `description`. `feature` marks an optional group as a feature the level
 * turns on, with the words for the switch. `widget` asks for a control
 * other than the one the node's type would get.
 */
declare module 'zod' {
  interface GlobalMeta {
    feature?: string;
    widget?: 'lines' | 'names' | 'json' | 'markdown';
    placeholder?: string;
  }
}

// These lists repeat the lab's own, so that this module stays free of the
// lab's runtime code. The type checks below keep them the same.
export const IMAGE_TYPES = ['sprite', 'background', 'block'] as const;
export const IMAGE_SUBJECTS = ['character', 'object'] as const;
export const IMAGE_SOURCES = ['cached', 'live'] as const;
export const TABS = ['Code', 'Images', 'World', 'Play'] as const;
export const CALLOUT_TARGETS = [
  'images-tab',
  'world-tab',
  'code-tab',
  'scene-menu',
  'scene-option',
  'continue-button',
] as const;
export const CALLOUT_DIRECTIONS = ['up', 'down', 'left'] as const;

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const sameLists: [
  Same<(typeof IMAGE_TYPES)[number], ImageType>,
  Same<(typeof IMAGE_SUBJECTS)[number], ImageSubject>,
  Same<(typeof IMAGE_SOURCES)[number], ImageSource>,
  Same<(typeof TABS)[number], Tab>,
  Same<(typeof CALLOUT_TARGETS)[number], CalloutTarget>,
  Same<(typeof CALLOUT_DIRECTIONS)[number], CalloutDirection>
] = [true, true, true, true, true, true];
void sameLists;

/** The parts of a project a student can change. */
export const PROJECT_PARTS = ['code', 'images', 'world'] as const;
export type ProjectPart = (typeof PROJECT_PARTS)[number];

/** Where a level opens: one of the parts, or the game itself. */
export const FOCUSES = [...PROJECT_PARTS, 'play'] as const;
export type Focus = (typeof FOCUSES)[number];

// A role is a name an image level records on the image it makes, such as
// "hero" or "treasure", so that later levels can find that image.
const role = z.string().trim().min(1).meta({placeholder: 'hero'});
const roles = z.array(role).meta({widget: 'names'});
const blockType = z.string().trim().min(1).meta({placeholder: 'block type'});

// Blockly's own serialized forms: they are edited as JSON.
const blockState = z
  .custom<AddBlock>(
    value => !!value && typeof value === 'object' && 'type' in value
  )
  .meta({widget: 'json'});
const workspace = z
  .custom<WorkspaceSerialization>(
    value => !!value && typeof value === 'object' && !Array.isArray(value)
  )
  .meta({widget: 'json'});

// ---- Images --------------------------------------------------------------

const madeImage = z
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
    role: role.optional().meta({
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

const starterImage = z.strictObject({
  name: z.string().min(1).meta({title: 'Name'}),
  imageType: z.enum(IMAGE_TYPES).meta({title: 'Type'}),
  role: role.optional().meta({title: 'Role'}),
  src: z.string().min(1).meta({
    title: 'Picture URL',
    placeholder: 'https://…/picture.png',
  }),
  frameSize: z
    .strictObject({
      x: z.number().int().positive().meta({title: 'Width'}),
      y: z.number().int().positive().meta({title: 'Height'}),
    })
    .meta({title: 'Size in pixels'}),
  pixelGridSize: z.number().int().positive().optional().meta({
    title: 'Pixel size',
    description:
      'For pixel art: the size of one drawn pixel in the file, so previews upscale it with hard edges.',
  }),
});

const images = z.strictObject({
  makes: madeImage.optional().meta({
    title: 'The image this level makes',
    feature: 'This level makes an image',
    description:
      'The student makes one image of a set type, which the level records with a role.',
  }),
  makeFirst: z.boolean().optional().meta({
    title: 'Make the image first',
    description:
      'The level opens on the Images tab to make its image, then goes on to where it opens.',
  }),
  onlyThisImage: z.boolean().optional().meta({
    title: 'Only this image',
    description:
      'The student sees only the image this level makes, with no adding or deleting.',
  }),
  canAdd: z.boolean().optional().meta({
    title: 'Can add images',
    description: 'On when not set.',
  }),
  canDelete: z.boolean().optional().meta({
    title: 'Can delete images',
    description:
      'On when not set. Turn off when a later level depends on an image made earlier.',
  }),
  kinds: z.array(z.enum(IMAGE_TYPES)).optional().meta({
    title: 'Kinds listed',
    description: 'The kinds of image the tab lists. Every kind when not set.',
  }),
  paintTools: z.enum(['all', 'limited']).optional().meta({
    title: 'Paint tools',
    description:
      'Limited is a fixed set of colors and one brush, for a level that is not about painting. All when not set.',
  }),
  generationLimit: z.number().int().positive().optional().meta({
    title: 'Generation limit',
    description:
      'How many pictures the student can generate in one visit. No limit when not set.',
  }),
  explainAi: z.boolean().optional().meta({
    title: 'Explain how AI made it',
    description:
      'After the first picture made in a visit, the level offers the story of how AI made it.',
  }),
  upload: z.boolean().optional().meta({
    title: 'Upload',
    description: 'The student can upload an image.',
  }),
  source: z.enum(IMAGE_SOURCES).optional().meta({
    title: 'Picture source',
    description:
      'Cached pictures come from the published set; live asks the model, for levelbuilders only. Cached when not set.',
  }),
  starters: z.array(starterImage).optional().meta({
    title: 'Starter images',
    description:
      'Images the level gives the project on arrival, when it has none of that name or role yet.',
  }),
});

// ---- World ---------------------------------------------------------------

const world = z.strictObject({
  palette: roles.optional().meta({
    title: 'Palette roles',
    description:
      "The roles of the images the student can place. The level's own image when not set.",
  }),
  keepsOneOf: roles.optional().meta({
    title: 'Keeps at least one of',
    description:
      'For each of these roles, the last square showing it cannot be erased until another is placed.',
  }),
});

// ---- Scenes --------------------------------------------------------------

const premadeWorld = z.strictObject({
  pattern: z.array(z.string()).min(1).meta({
    title: 'Pattern',
    widget: 'lines',
    description:
      'One line for each row, the floor last. B is a block, S is the player, and a dot is empty.',
  }),
  roles: z.record(z.string().length(1), role).optional().meta({
    title: 'Pattern letters',
    description:
      'More letters, each standing for the newest sprite with a role, such as F for "friend".',
  }),
});

const scene = z.strictObject({
  id: z.string().min(1).meta({
    title: 'Id',
    placeholder: 'scene-1',
    description:
      'What the go to scene block stores. "scene-1" is the scene every project starts with.',
  }),
  name: z.string().min(1).meta({
    title: 'Name',
    placeholder: 'Scene 1',
    description: 'What the student sees, when the level creates the scene.',
  }),
  code: workspace.optional().meta({
    title: 'Starting code',
    description: "The scene's code when the level creates it.",
  }),
  world: premadeWorld.optional().meta({
    title: 'Premade world',
    feature: 'The scene starts with a premade world',
  }),
  editable: z.boolean().optional().meta({
    title: 'Student can open it',
    description: 'For a second scene: the student can open it in the editor.',
  }),
});

const scenes = z
  .strictObject({
    starting: z.array(scene).max(2).optional().meta({
      title: 'Scenes the level sets up',
      description:
        'The level makes sure the project has these. The first is the scene the level opens, and the student is kept to these.',
    }),
    canChange: z.boolean().optional().meta({
      title: 'Student can change scenes',
      description: 'The student can add, rename, reorder and delete scenes.',
    }),
  })
  .superRefine((value, context) => {
    if (value.canChange && value.starting?.length) {
      context.addIssue({
        code: 'custom',
        path: ['canChange'],
        message:
          'A level that sets up scenes keeps the student to them, so it cannot also let them change scenes.',
      });
    }
    if (value.starting?.[0]?.editable !== undefined) {
      context.addIssue({
        code: 'custom',
        path: ['starting', 0, 'editable'],
        message: 'The first scene is always the one the student edits.',
      });
    }
  });

// ---- Code scaffolding ----------------------------------------------------

const attachShadow = z
  .strictObject({
    attachTo: blockType.meta({
      title: 'Under the stack whose top block is',
    }),
    data: z.string().optional().meta({
      title: 'Tag',
      description: "The top block's tag, when one stack of the type is meant.",
    }),
    shadow: blockState.meta({title: 'Placeholder block'}),
  })
  .meta({title: 'A placeholder under a stack'});

const attachRoom = z
  .strictObject({
    attachTo: blockType.meta({
      title: 'Under the stack whose top block is',
    }),
    data: z.string().optional().meta({title: 'Tag'}),
    room: z
      .strictObject({
        type: blockType.meta({title: 'Room for a block of type'}),
      })
      .meta({title: 'Room'}),
  })
  .meta({title: 'Empty room under a stack'});

const addedBlock = z
  .union([attachShadow, attachRoom, blockState.meta({title: 'A new stack'})])
  .meta({title: 'Block'});

const blocks = z.strictObject({
  addOnArrival: z.array(addedBlock).optional().meta({
    title: 'Blocks added on arrival',
    description:
      'Added to the first scene when the student arrives, if it has none of that kind.',
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
  alwaysInToolbox: z.array(blockType).optional().meta({
    title: 'Always in the toolbox',
    widget: 'names',
    description:
      'With the catalog: blocks that are in the toolbox from the start.',
  }),
  dropdownsStartOn: z
    .record(blockType, z.union([role, roles]))
    .optional()
    .meta({
      title: 'Dropdowns start on',
      description:
        'The role each image dropdown starts on, by image kind (sprite, background, block) or by block type.',
    }),
});

// ---- Checklist -----------------------------------------------------------

const check = z
  .discriminatedUnion('kind', [
    z
      .strictObject({
        kind: z.literal('image'),
        imageType: z.enum(IMAGE_TYPES).meta({title: 'Type'}),
      })
      .meta({title: 'Made an image'}),
    z
      .strictObject({
        kind: z.literal('generated'),
        imageType: z.enum(IMAGE_TYPES).optional().meta({
          title: 'Type',
          description: 'Any type when not set.',
        }),
      })
      .meta({title: 'Generated a picture'}),
    z
      .strictObject({
        kind: z.literal('block'),
        type: z.union([blockType, z.array(blockType).min(1)]).meta({
          title: 'Block type',
          widget: 'names',
          description: 'One block type, or any of several.',
        }),
        under: blockType.optional().meta({
          title: 'Under a top block of type',
        }),
        data: z.string().optional().meta({
          title: 'Under the stack tagged',
          description: 'The tag of a stack the level adds.',
        }),
        fields: z.record(z.string(), z.string()).optional().meta({
          title: 'Field values',
        }),
        scene: z.string().optional().meta({
          title: 'In scene',
          description: 'By id. The open scene when not set.',
        }),
      })
      .meta({title: 'Uses a block'}),
    z
      .strictObject({
        kind: z.literal('world'),
        role: role.optional().meta({
          title: 'Shows an image with role',
        }),
        changed: z.boolean().optional().meta({
          title: 'Changed from the start',
        }),
      })
      .meta({title: 'Placed in the world'}),
    z.strictObject({kind: z.literal('play')}).meta({title: 'Pressed Run'}),
    z
      .strictObject({
        kind: z.literal('reach'),
        role: role.optional().meta({title: 'Touched a sprite with role'}),
        moved: z.boolean().optional().meta({title: 'Moved or jumped'}),
      })
      .meta({title: 'Player reached'}),
    z
      .strictObject({
        kind: z.literal('scene'),
        id: z.string().min(1).meta({title: 'Scene id'}),
      })
      .meta({title: 'Got to a scene'}),
    z
      .strictObject({
        kind: z.literal('editing'),
        id: z.string().min(1).meta({title: 'Scene id'}),
      })
      .meta({title: 'Opened a scene'}),
    z.strictObject({kind: z.literal('rated')}).meta({title: 'Rated a picture'}),
  ])
  .meta({title: 'Done when'});

// The schema's checks and the lab's must stay the same list.
const sameChecks: Same<z.infer<typeof check>['kind'], ObjectiveCheck['kind']> =
  true;
void sameChecks;

const step = z.strictObject({
  text: z.string().min(1).meta({
    title: 'Text',
    widget: 'markdown',
    placeholder: 'Select **Run**.',
  }),
  check,
  shownWhen: check.optional().meta({
    title: 'Hidden until',
    feature: 'Hide this step until something is done',
  }),
  id: z.string().optional().meta({
    title: 'Id',
    description: "Names the step to the lab's hover and click handling.",
  }),
});

const objectives = z.strictObject({
  title: z.string().optional().meta({title: 'Title', widget: 'markdown'}),
  steps: z.array(step).optional().meta({
    title: 'Steps',
    description:
      'The student continues once every step is done. With no steps they can continue from the start.',
  }),
  collapsedText: z.string().optional().meta({
    title: 'Collapsed text',
    description:
      'A short line that stays in view when the steps are collapsed.',
  }),
});

// ---- Callouts ------------------------------------------------------------

const calloutSpot = {
  target: z.enum(CALLOUT_TARGETS).meta({title: 'Points at'}),
  scene: z.string().optional().meta({
    title: 'Scene',
    description: 'For a scene-option target: the scene, by id.',
  }),
  direction: z.enum(CALLOUT_DIRECTIONS).optional().meta({
    title: 'Arrow direction',
    description: 'Up when not set.',
  }),
};

const callout = z.strictObject({
  ...calloutSpot,
  fallback: z.strictObject(calloutSpot).optional().meta({
    title: 'While the target is hidden',
    feature: 'Point somewhere else while the target is not on the page',
  }),
  when: z
    .strictObject({
      done: z.array(z.number().int().min(0)).optional().meta({
        title: 'After steps',
        description: 'Checklist steps, counted from 0, that must be done.',
      }),
      notDone: z.array(z.number().int().min(0)).optional().meta({
        title: 'Until steps',
        description:
          'Checklist steps, counted from 0, that must not be done yet.',
      }),
      tabNot: z.enum(TABS).optional().meta({
        title: 'While not on tab',
      }),
      sceneNot: z.string().optional().meta({
        title: 'While not on scene',
      }),
    })
    .optional()
    .meta({title: 'Shown when', feature: 'Only show it at certain times'}),
});

// ---- The level -----------------------------------------------------------

export const levelConfigSchema = z
  .strictObject({
    focus: z.enum(FOCUSES).optional().meta({
      title: 'Opens on',
      description: 'Where the level opens. Code when not set.',
    }),
    edits: z.array(z.enum(PROJECT_PARTS)).optional().meta({
      title: 'Student can change',
      feature: 'Limit what the student can change',
      description:
        'Code, and the Images and World tabs the level turns on, when not set.',
    }),
    images: images.optional().meta({
      title: 'Images',
      feature: 'Images tab',
      description: 'The student works with images on the Images tab.',
    }),
    world: world.optional().meta({
      title: 'World',
      feature: 'World tab',
      description: 'The student places images on a grid on the World tab.',
    }),
    scenes: scenes.optional().meta({
      title: 'Scenes',
      feature: 'Scenes',
      description:
        'The level sets up scenes, or lets the student make their own.',
    }),
    blocks: blocks.optional().meta({
      title: 'Code scaffolding',
      feature: 'Code scaffolding',
      description:
        'Blocks the level adds or locks, the block catalog, and where dropdowns start.',
    }),
    objectives: objectives.optional().meta({
      title: 'Checklist',
      feature: 'Checklist',
      description: 'Steps the student does before they can continue.',
    }),
    callouts: z.array(callout).optional().meta({
      title: 'Callouts',
      feature: 'Callouts',
      description:
        'Bouncing arrows at the tabs, the scene menu or Continue. The first one whose condition holds is shown.',
    }),
    instructions: z
      .strictObject({
        startCollapsed: z.boolean().optional().meta({
          title: 'Start collapsed',
          description: 'The instructions panel starts collapsed to its tab.',
        }),
        freePlayIntro: z.boolean().optional().meta({
          title: 'Free play intro',
          description:
            'The intro dialog opens the first time the student arrives.',
        }),
      })
      .optional()
      .meta({title: 'Instructions', feature: 'Instructions options'}),
  })
  .superRefine((config, context) => {
    const parts = editableParts(config);
    if (config.edits?.includes('images') && !config.images) {
      context.addIssue({
        code: 'custom',
        path: ['edits'],
        message: 'Images can be changed only on a level with the Images tab.',
      });
    }
    if (config.edits?.includes('world') && !config.world) {
      context.addIssue({
        code: 'custom',
        path: ['edits'],
        message: 'The world can be changed only on a level with the World tab.',
      });
    }
    const focus = config.focus ?? 'code';
    if (focus !== 'play' && !parts.includes(focus)) {
      context.addIssue({
        code: 'custom',
        path: ['focus'],
        message: `The level opens on ${focus}, which the student cannot change here.`,
      });
    }
  });

export type LevelConfig = z.infer<typeof levelConfigSchema>;

/** The parts of the project the student can change on a level. */
export function editableParts(config: LevelConfig): ProjectPart[] {
  if (config.edits) {
    return PROJECT_PARTS.filter(part => config.edits?.includes(part));
  }
  return PROJECT_PARTS.filter(
    part =>
      part === 'code' ||
      (part === 'images' && !!config.images) ||
      (part === 'world' && !!config.world)
  );
}

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

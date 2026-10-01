import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

import level from '../../../../../../dashboard/config/levels/custom/spritelab/hoai2026-dev-spritelab-lab2-freeplay.level?raw';

import {SPRITE_AI_IMAGES} from './aiImages';
import background from './aiImages/background.png?inline';
import {poolBlocks} from './blockPools';

// The hoai2026-dev unit's free-play level, read from its .level file so the
// toolbox, guide and image roles follow the course. The project is what a
// student might arrive with: the hero, friend and treasure the unit's image
// levels make, a background, a ground block, and a story and a platform
// scene, which is what splits the authored toolbox.

const properties = JSON.parse(
  level.slice(
    level.indexOf('<![CDATA[') + '<![CDATA['.length,
    level.lastIndexOf(']]>'),
  ),
).properties;

function svg(body: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">${body}</svg>`,
  )}`;
}

function image(
  name: string,
  sourceUrl: string,
  extra: {role?: string; categories?: string[]} = {},
) {
  return {
    name,
    sourceUrl,
    frameSize: {x: 100, y: 100},
    frameCount: 1,
    looping: true,
    frameDelay: 2,
    ...extra,
  };
}

const IMAGES = {
  hero: image('hero', svg('<circle cx="50" cy="50" r="40" fill="#f28c28"/>'), {
    role: 'hero',
  }),
  friend: image(
    'friend',
    svg('<circle cx="50" cy="50" r="40" fill="#7a4ec2"/>'),
    {role: 'friend'},
  ),
  treasure: image(
    'treasure',
    svg('<polygon points="50,10 90,50 50,90 10,50" fill="#f5c518"/>'),
    {role: 'treasure'},
  ),
  meadow: image('meadow', background, {categories: ['backgrounds']}),
  ground: image(
    'ground',
    svg(
      '<rect width="100" height="100" fill="#8c5a32"/>' +
        '<rect width="100" height="25" fill="#50aa3c"/>',
    ),
    {categories: ['blocks']},
  ),
};

const field = (name: string) => JSON.stringify(name);

const STORY = {
  blocks: {
    blocks: [
      {
        type: 'spritelab2_whenRun',
        x: 20,
        y: 20,
        deletable: false,
        movable: false,
        next: {
          block: {
            type: 'gamelab_setBackgroundImageAs',
            fields: {IMG: field('meadow')},
            next: {
              block: {
                type: 'spritelab2_makeSpriteAtPosition',
                fields: {ANIMATION_NAME: field('hero'), POSITION: 'left'},
                next: {
                  block: {
                    type: 'spritelab2_makeSpriteAtPosition',
                    fields: {
                      ANIMATION_NAME: field('friend'),
                      POSITION: 'right',
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
};

const PLATFORM = {
  blocks: {
    blocks: [
      {
        type: 'spritelab2_whenRun',
        x: 20,
        y: 20,
        deletable: false,
        movable: false,
        next: {
          block: {
            type: 'gamelab_setBackgroundImageAs',
            fields: {IMG: field('meadow')},
            next: {
              block: {
                type: 'spritelab2_setAsPlatformPlayer',
                fields: {ANIMATION_NAME: field('hero')},
              },
            },
          },
        },
      },
    ],
  },
};

// The default 10-cell playfield is the grid's top-left corner; the rest is
// room to scroll into. A floor along the playfield's bottom row, the hero
// standing on it and the treasure a little way off.
const SIDE = 30;
const FLOOR = 9;
const grid: ({image: string; kind: 'block' | 'sprite'} | null)[][] = Array.from(
  {length: SIDE},
  (_, row) =>
    Array.from({length: SIDE}, () =>
      row === FLOOR ? {image: 'ground', kind: 'block' as const} : null,
    ),
);
grid[FLOOR - 1][1] = {image: 'hero', kind: 'sprite'};
grid[FLOOR - 1][6] = {image: 'treasure', kind: 'sprite'};

const hoai2026: LabFixture = {
  levelProperties: {
    '1': createLevelPropertyFixture({
      id: 1,
      name: 'hoai2026-dev-spritelab-lab2-freeplay',
      type: 'SpriteLab2',
      appName: 'spritelab',
      isProjectLevel: true,
      usesProjects: true,
      helpVideos: [],
      isAssessment: false,
      offerBrowserTts: false,
      showExemplarLink: false,
      sharedBlocks: poolBlocks(...properties.block_pools),
      helperLibraries: properties.helper_libraries,
      levelMode: properties.level_mode,
      imageRoleDefaults: properties.image_role_defaults,
      guideSteps: properties.guide_steps,
      longInstructions: properties.long_instructions,
      hideCustomBlocks: properties.hide_custom_blocks,
      toolboxDefinition: properties.toolbox_definition,
    }),
  },
  sources: {
    source: '',
    scenes: [
      {id: 'story', name: 'Story', type: 'story', source: STORY},
      {
        id: 'platform',
        name: 'Platform',
        type: 'platform',
        source: PLATFORM,
        world: {grid},
      },
    ],
    animations: {
      orderedKeys: Object.keys(IMAGES),
      propsByKey: IMAGES,
    },
  } as unknown as LabFixture['sources'],
  theme: {},
  aiImages: SPRITE_AI_IMAGES,
};

export default hoai2026;

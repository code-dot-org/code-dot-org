import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

// A level offering the lab's own blocks, and a project with two images and
// a scene that makes a sprite of each. The images are SVG data URLs, so the
// scenario runs without Rails or an animation library.

function circle(color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">` +
    `<circle cx="50" cy="50" r="40" fill="${color}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function image(name: string, color: string) {
  return {
    name,
    sourceUrl: circle(color),
    frameSize: {x: 100, y: 100},
    frameCount: 1,
    looping: true,
    frameDelay: 2,
  };
}

function makeSprite(name: string, position: string) {
  return {
    type: 'spritelab2_makeSpriteAtPosition',
    fields: {ANIMATION_NAME: JSON.stringify(name), POSITION: position},
  };
}

const PROGRAM = {
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
            ...makeSprite('cat', 'left'),
            next: {block: makeSprite('dog', 'right')},
          },
        },
      },
    ],
  },
};

const simple: LabFixture = {
  levelProperties: {
    '1': createLevelPropertyFixture({
      id: 1,
      name: 'Sprite Lab sample',
      type: 'SpriteLab2',
      appName: 'spritelab',
      isProjectLevel: true,
      usesProjects: true,
      helpVideos: [],
      isAssessment: false,
      offerBrowserTts: false,
      showExemplarLink: false,
      toolboxDefinition: {
        kind: 'flyoutToolbox',
        contents: [
          {kind: 'block', type: 'spritelab2_makeSpriteAtPosition'},
          {kind: 'block', type: 'spritelab2_goToScene'},
          {kind: 'block', type: 'spritelab2_restartScene'},
        ],
      },
    }),
  },
  // The program is a scene's. An empty `source` keeps the registry from
  // reporting it as the level's startSources, which core's schema takes
  // only in Code Bridge's multi-file form.
  sources: {
    source: '',
    scenes: [{id: 'scene-1', name: 'Scene 1', source: PROGRAM}],
    animations: {
      orderedKeys: ['cat-key', 'dog-key'],
      propsByKey: {
        'cat-key': image('cat', '#f28c28'),
        'dog-key': image('dog', '#7a4ec2'),
      },
    },
  } as unknown as LabFixture['sources'],
  theme: {},
};

export default simple;

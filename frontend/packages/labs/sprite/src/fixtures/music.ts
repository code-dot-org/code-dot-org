import type {LabFixture} from '@code-dot-org/core/api/mocks';

import simple from './simple';

// The simple project with background music: the scene plays one of the
// user's Music Lab songs, a loop of the library's electro beats. The song's
// sound files come from the real library at curriculum.code.org.

const SONG = 'tune';

const beat = (id: string, src: string, next?: object) => ({
  block: {
    type: 'play_sound_at_current_location_simple2',
    id,
    fields: {sound: `electro/${src}`},
    ...(next ? {next} : {}),
  },
});

const SONG_SOURCES = {
  source: JSON.stringify({
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'when_run_simple2',
          id: 'run',
          x: 30,
          y: 30,
          next: beat('b1', 'drum_beat_club', beat('b2', 'drum_beat_edm')),
        },
      ],
    },
  }),
  labConfig: {
    music: {library: 'launch2024', packId: 'default', blockMode: 'Simple2'},
  },
};

const scene = (
  simple.sources as unknown as {
    scenes: {source: {blocks: {blocks: {next: object}[]}}}[];
  }
).scenes[0];
const whenRun = scene.source.blocks.blocks[0];

const music: LabFixture = {
  ...simple,
  routes: [
    {
      path: '*/api/v1/projects/personal',
      respond: [
        {
          channel: SONG,
          name: 'Electro tune',
          type: 'music',
          updatedAt: '2026-09-01T12:00:00Z',
          labConfig: {music: {packId: 'default'}},
        },
      ],
    },
    {path: `*/v3/sources/${SONG}/main.json`, respond: SONG_SOURCES},
  ],
  sources: {
    ...(simple.sources as object),
    scenes: [
      {
        ...scene,
        source: {
          blocks: {
            blocks: [
              {
                ...whenRun,
                next: {
                  block: {
                    type: 'spritelab2_playMusic',
                    fields: {SONG},
                    next: whenRun.next,
                  },
                },
              },
            ],
          },
        },
      },
    ],
  } as unknown as LabFixture['sources'],
};

export default music;

import {describe, expect, it, vi} from 'vitest';

import {DashboardApiClient} from '@code-dot-org/core/api';

import {
  collectSavedSongs,
  fetchMusicProjects,
  musicProjectOptions,
  withUnavailableSongs,
} from '../musicProjects';

vi.mock('@code-dot-org/core/api', async importOriginal => ({
  ...(await importOriginal<object>()),
  DashboardApiClient: {projects: {getPersonal: vi.fn()}},
}));
// Music's player modules are not loaded; only the pack rule is read.
vi.mock('@code-dot-org/music-lab/player', () => ({
  isOnDefaultPack: (labConfig?: {music?: {packId?: string}}) =>
    labConfig?.music?.packId === 'default',
}));

// Music's rule, restated: the real one comes with Music's player modules.
const isOnDefaultPack = (labConfig?: {music?: {packId?: string}}) =>
  labConfig?.music?.packId === 'default';

describe('SpriteLab2 musicProjects', () => {
  const today = new Date('2026-08-29T12:00:00Z');

  it('offers only music projects kept on the default pack, newest first, dated', () => {
    const onDefault = {labConfig: {music: {packId: 'default'}}};
    const options = musicProjectOptions(
      [
        {
          channel: 'a',
          name: 'Old song',
          type: 'music',
          updatedAt: '2025-01-05T12:00:00Z',
          ...onDefault,
        },
        {
          channel: 'b',
          name: 'A game',
          type: 'spritelab',
          updatedAt: '2026-03-01T12:00:00Z',
          ...onDefault,
        },
        {
          channel: 'c',
          name: 'New song',
          type: 'music',
          updatedAt: '2026-08-25T12:00:00Z',
          ...onDefault,
        },
        {channel: 'd', type: 'music', ...onDefault},
        {channel: '', name: 'No channel', type: 'music', ...onDefault},
        // No pack recorded: the choice was never made.
        {
          channel: 'g',
          name: 'Undecided',
          type: 'music',
          updatedAt: '2026-08-28T12:00:00Z',
        },
        {
          channel: 'h',
          name: 'Undecided too',
          type: 'music',
          updatedAt: '2026-08-28T12:00:00Z',
          labConfig: {music: {}},
        },
        {
          channel: 'e',
          name: 'Packed',
          type: 'music',
          updatedAt: '2026-08-26T12:00:00Z',
          labConfig: {music: {packId: 'some-pack'}},
        },
        {
          channel: 'f',
          name: 'Default pack',
          type: 'music',
          updatedAt: '2026-08-27T12:00:00Z',
          labConfig: {music: {packId: 'default'}},
        },
      ],
      isOnDefaultPack,
      today,
    );
    expect(options.map(o => o.channel)).toEqual(['f', 'c', 'a', 'd']);
    expect(options[0].name).toMatch(/^Default pack · Aug 27$/);
    expect(options[1].name).toMatch(/^New song · Aug 25$/);
    // Another year says so.
    expect(options[2].name).toMatch(/^Old song · Jan 5, 2025$/);
    // No date recorded: the name alone.
    expect(options[3].name).toBe('Untitled song');
  });

  it('finds the songs saved play-music blocks refer to, and keeps them as placeholders', () => {
    const scenes = [
      {
        id: 'a',
        name: 'A',
        source: {
          blocks: {
            blocks: [
              {
                type: 'spritelab2_whenRun',
                next: {
                  block: {type: 'spritelab2_playMusic', fields: {SONG: 'kept'}},
                },
              },
              {
                type: 'gamelab_spriteClicked',
                inputs: {
                  DO: {
                    block: {
                      type: 'spritelab2_playMusic',
                      fields: {SONG: 'gone'},
                    },
                  },
                },
              },
              {type: 'spritelab2_playMusic', fields: {SONG: ''}},
            ],
          },
        },
      },
    ];
    const saved = collectSavedSongs(scenes as never);
    expect(saved.sort()).toEqual(['gone', 'kept']);
    const options = withUnavailableSongs(
      [{channel: 'kept', name: 'Kept'}],
      saved,
    );
    expect(options).toEqual([
      {channel: 'kept', name: 'Kept'},
      {channel: 'gone', name: '(unavailable)', unavailable: true},
    ]);
  });
});

describe('fetchMusicProjects', () => {
  it("lists the user's songs on the default pack", async () => {
    vi.mocked(DashboardApiClient.projects.getPersonal).mockResolvedValue([
      {
        channel: 'song',
        name: 'Tune',
        type: 'music',
        labConfig: {music: {packId: 'default'}},
      },
      {
        channel: 'other',
        name: 'Packed',
        type: 'music',
        labConfig: {music: {packId: 'some-pack'}},
      },
    ]);
    const options = await fetchMusicProjects();
    expect(options).toEqual([{channel: 'song', name: 'Tune'}]);
  });
});

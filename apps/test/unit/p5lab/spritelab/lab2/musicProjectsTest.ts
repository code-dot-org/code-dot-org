import {musicProjectOptions} from '@cdo/apps/p5lab/spritelab/lab2/musicProjects';

describe('SpriteLab2 musicProjects', () => {
  it('offers only music projects, newest first, with a name for each', () => {
    const options = musicProjectOptions([
      {channel: 'a', name: 'Old song', type: 'music', updatedAt: '2026-01-01'},
      {
        channel: 'b',
        name: 'A game',
        type: 'spritelab',
        updatedAt: '2026-03-01',
      },
      {channel: 'c', name: 'New song', type: 'music', updatedAt: '2026-02-01'},
      {channel: 'd', type: 'music'},
      {channel: '', name: 'No channel', type: 'music'},
    ]);
    expect(options).toEqual([
      {channel: 'c', name: 'New song'},
      {channel: 'a', name: 'Old song'},
      {channel: 'd', name: 'Untitled song'},
    ]);
  });
});

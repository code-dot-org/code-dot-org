import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {Channel} from '@cdo/apps/lab2/types';
import MusicLibrary, {LibraryJson} from '@cdo/apps/music/player/MusicLibrary';
import MiniMusicPlayer from '@cdo/apps/music/views/MiniMusicPlayer';

const mockLoadCode = jest.fn();
const mockLoadSources = jest.fn();

jest.mock('@cdo/apps/lab2/projects/SourcesStore', () => ({
  SourcesStore: jest.fn(() => ({load: mockLoadSources})),
}));
jest.mock('@cdo/apps/music/analytics/AnalyticsReporter', () =>
  jest.fn(() => ({startSession: jest.fn(), onButtonClicked: jest.fn()}))
);
jest.mock('@cdo/apps/music/blockly/blockUtils', () => ({
  installFunctionBlocks: jest.fn(),
}));
jest.mock('@cdo/apps/music/blockly/MusicBlocklyWorkspace', () =>
  jest.fn(() => ({
    initHeadless: jest.fn(),
    loadCode: mockLoadCode,
    compileSong: jest.fn(),
    executeAllTriggers: () => [],
    executeCompiledSong: () => ({playbackEvents: []}),
  }))
);
jest.mock('@cdo/apps/music/blockly/setup', () => ({
  setUpBlocklyForMusicLab: jest.fn(),
}));
jest.mock('@cdo/apps/music/player/MusicPlayer', () =>
  jest.fn(() => ({
    stopSong: jest.fn(),
    updateConfiguration: jest.fn(),
    preloadSounds: jest.fn(),
    playSong: jest.fn(),
  }))
);

const pack = (id: string, restricted: boolean) => ({
  id,
  name: id,
  path: id,
  imageSrc: '',
  restricted,
  sounds: [{name: 'verse', src: 'verse', length: 1, type: 'beat'}],
});

describe('MiniMusicPlayer', () => {
  it('plays a project saved without its pack under the pack of its sounds', async () => {
    const library = new MusicLibrary('test', {
      id: 'test',
      name: 'test',
      imageSrc: '',
      path: 'test',
      packs: [pack('song', true), pack('drums', false)],
      instruments: [],
      kits: [],
    } as unknown as LibraryJson);
    jest.spyOn(MusicLibrary, 'loadLibrary').mockResolvedValue(library);
    jest.spyOn(MusicLibrary, 'getInstance').mockReturnValue(library);
    const setCurrentPackId = jest.spyOn(library, 'setCurrentPackId');
    mockLoadSources.mockResolvedValue({
      source: JSON.stringify({
        blocks: {blocks: [{type: 'play_sound', fields: {sound: 'song/verse'}}]},
      }),
      labConfig: {music: {library: 'test', blockMode: 'Simple2'}},
    });

    render(
      <MiniMusicPlayer
        projects={[{id: 'channel1', name: 'My song'} as Channel]}
        libraryName="test"
      />
    );
    await userEvent.click(await screen.findByText('My song'));

    await waitFor(() => expect(mockLoadCode).toHaveBeenCalledTimes(1));
    expect(setCurrentPackId).toHaveBeenLastCalledWith('song');
    expect(setCurrentPackId.mock.invocationCallOrder[0]).toBeLessThan(
      mockLoadCode.mock.invocationCallOrder[0]
    );
  });
});

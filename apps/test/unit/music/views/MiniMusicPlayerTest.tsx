import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {Channel} from '@cdo/apps/lab2/types';
import MusicLibrary, {LibraryJson} from '@cdo/apps/music/player/MusicLibrary';
import MiniMusicPlayer from '@cdo/apps/music/views/MiniMusicPlayer';

const mockLoadCode = jest.fn();
const mockLoadSources = jest.fn();
const mockPlaySong = jest.fn();
const mockPreloadSounds = jest.fn();

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
    preloadSounds: mockPreloadSounds,
    playSong: mockPlaySong,
  }))
);

const pack = (id: string, name: string, restricted: boolean) => ({
  id,
  name,
  artist: `${name} artist`,
  path: id,
  imageSrc: '',
  restricted,
  sounds: [{name: 'verse', src: 'verse', length: 1, type: 'beat'}],
});

const sourcesWithSound = (sound: string) => ({
  source: JSON.stringify({
    blocks: {blocks: [{type: 'play_sound', fields: {sound}}]},
  }),
  labConfig: {music: {library: 'test', blockMode: 'Simple2'}},
});

describe('MiniMusicPlayer', () => {
  let library: MusicLibrary;
  let setCurrentPackId: jest.SpyInstance;

  beforeEach(() => {
    library = new MusicLibrary('test', {
      id: 'test',
      name: 'test',
      imageSrc: '',
      path: 'test',
      packs: [
        pack('song', 'First song', true),
        pack('song2', 'Second song', true),
        pack('drums', 'Drums', false),
      ],
      instruments: [],
      kits: [],
    } as unknown as LibraryJson);
    jest.spyOn(MusicLibrary, 'loadLibrary').mockResolvedValue(library);
    jest.spyOn(MusicLibrary, 'getInstance').mockReturnValue(library);
    setCurrentPackId = jest.spyOn(library, 'setCurrentPackId');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockLoadSources.mockReset();
    mockPreloadSounds.mockReset();
  });

  it('plays a project saved without its pack under the pack of its sounds, and shows that pack', async () => {
    mockLoadSources.mockResolvedValue(sourcesWithSound('song/verse'));

    render(
      <MiniMusicPlayer
        projects={[{id: 'channel1', name: 'My song'} as Channel]}
        libraryName="test"
      />
    );
    await screen.findByText('My song');
    expect(screen.queryByText(/First song/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('My song'));

    await waitFor(() => expect(mockPlaySong).toHaveBeenCalledTimes(1));
    expect(setCurrentPackId).toHaveBeenLastCalledWith('song');
    expect(setCurrentPackId.mock.invocationCallOrder[0]).toBeLessThan(
      mockLoadCode.mock.invocationCallOrder[0]
    );
    expect(screen.getByText(/First song/)).toBeInTheDocument();
  });

  it('plays only the project clicked last when an earlier one loads later', async () => {
    let finishFirstLoad: (sources: object) => void = () => {};
    mockLoadSources.mockImplementation((channelId: string) =>
      channelId === 'channel1'
        ? new Promise(resolve => (finishFirstLoad = resolve))
        : Promise.resolve(sourcesWithSound('song2/verse'))
    );

    render(
      <MiniMusicPlayer
        projects={[
          {id: 'channel1', name: 'My song'} as Channel,
          {id: 'channel2', name: 'Other song'} as Channel,
        ]}
        libraryName="test"
      />
    );
    await userEvent.click(await screen.findByText('My song'));
    await userEvent.click(screen.getByText('Other song'));
    await waitFor(() => expect(mockPlaySong).toHaveBeenCalledTimes(1));

    finishFirstLoad(sourcesWithSound('song/verse'));
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockLoadCode).toHaveBeenCalledTimes(1);
    expect(mockPlaySong).toHaveBeenCalledTimes(1);
    expect(setCurrentPackId).toHaveBeenLastCalledWith('song2');
  });

  it('plays only the project clicked last when an earlier one is still loading its sounds', async () => {
    let finishFirstPreload: () => void = () => {};
    mockLoadSources.mockResolvedValue(sourcesWithSound('song/verse'));
    mockPreloadSounds.mockImplementationOnce(
      () => new Promise<void>(resolve => (finishFirstPreload = resolve))
    );

    render(
      <MiniMusicPlayer
        projects={[
          {id: 'channel1', name: 'My song'} as Channel,
          {id: 'channel2', name: 'Other song'} as Channel,
        ]}
        libraryName="test"
      />
    );
    await userEvent.click(await screen.findByText('My song'));
    await waitFor(() => expect(mockPreloadSounds).toHaveBeenCalledTimes(1));
    await userEvent.click(screen.getByText('Other song'));
    await waitFor(() => expect(mockPlaySong).toHaveBeenCalledTimes(1));

    finishFirstPreload();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockPlaySong).toHaveBeenCalledTimes(1);
  });
});

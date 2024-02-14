import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Channel} from '../../lab2/types';
import MusicPlayer from '../player/MusicPlayer';
import MusicBlocklyWorkspace from '../blockly/MusicBlocklyWorkspace';
import Simple2Sequencer from '../player/sequencer/Simple2Sequencer';
import {
  RemoteSourcesStore,
  SourcesStore,
} from '../../lab2/projects/SourcesStore';
import {loadLibrary} from '../utils/Loader';
import MusicLibrary from '../player/MusicLibrary';
import {setUpBlocklyForMusicLab} from '../blockly/setup';
import Lab2Registry from '../../lab2/Lab2Registry';
import moduleStyles from './MiniMusicPlayer.module.scss';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

interface MiniPlayerViewProps {
  projects: Channel[];
  libraryName: string;
}

const MiniPlayerView: React.FunctionComponent<MiniPlayerViewProps> = ({
  projects,
  libraryName,
}) => {
  const playerRef = useRef<MusicPlayer>(new MusicPlayer());
  const workspaceRef = useRef<MusicBlocklyWorkspace>(
    new MusicBlocklyWorkspace()
  );
  const sequencerRef = useRef<Simple2Sequencer>(new Simple2Sequencer());
  const sourcesStoreRef = useRef<SourcesStore>(new RemoteSourcesStore());
  const [isLoading, setIsLoading] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(
    undefined
  );

  // Setup library and workspace on mount
  const onMount = useCallback(async () => {
    setUpBlocklyForMusicLab();
    workspaceRef.current.initHeadless();
    const library = await loadLibrary(libraryName);
    MusicLibrary.setCurrent(library);
    setIsLoading(false);
  }, [libraryName]);

  useEffect(() => {
    onMount();
  }, [onMount]);

  // This is the main function that is called when a song is played in the mini player
  // Loads code from the server, compiles the song, executes it to generate events,
  // and then plays the events.
  // Optimization: cache code and/or compiled song after played once.
  // Setup library and workspace on mount
  const onMount = useCallback(async () => {
    setUpBlocklyForMusicLab();
    workspaceRef.current.initHeadless();
    const library = await loadLibrary(libraryName);
    MusicLibrary.setCurrent(library);
    setIsLoading(false);
  }, [libraryName]);

  useEffect(() => {
    onMount();
  }, [onMount]);

  // This is the main function that is called when a song is played in the mini player
  // Loads code from the server, compiles the song, executes it to generate events,
  // and then plays the events.
  // Optimization: cache code and/or compiled song after played once.
  const onPlaySong = useCallback(async (project: Channel) => {
    playerRef.current.stopSong();
    // Load code
    const projectSources = await sourcesStoreRef.current.load(project.id);
    workspaceRef.current.loadCode(JSON.parse(projectSources.source));

    // Compile song
    workspaceRef.current.compileSong({Sequencer: sequencerRef.current});

    // Execute compiled song
    // Sequence out all possible trigger events to preload sounds if necessary.
    sequencerRef.current.clear();
    workspaceRef.current.executeAllTriggers();
    const allTriggerEvents = sequencerRef.current.getPlaybackEvents();

    sequencerRef.current.clear();
    workspaceRef.current.executeCompiledSong();

    // Preload sounds in player
    await playerRef.current.preloadSounds(
      [...allTriggerEvents, ...sequencerRef.current.getPlaybackEvents()],
      (loadTimeMs, soundsLoaded) => {
        if (soundsLoaded > 0) {
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .reportLoadTime('MiniPlayer.SoundLoadTime', loadTimeMs);
        }
        Lab2Registry.getInstance().getMetricsReporter().logInfo({
          event: 'MiniPlayerSoundsLoaded',
          soundsLoaded,
          loadTimeMs,
          channelId: project.id,
        });
      }
    );

    // Play sounds
    playerRef.current.playSong(sequencerRef.current.getPlaybackEvents());
    setCurrentProjectId(project.id);
  }, []);

  const onStopSong = useCallback(async () => {
    playerRef.current.stopSong();
    setCurrentProjectId(undefined);
  }, []);

  // Some loading UI while we're fetching the library
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={moduleStyles.miniMusicPlayer}>
      {projects.map(project => {
        return (
          <div
            className={moduleStyles.entry}
            key={project.id}
            onClick={() => {
              project.id === currentProjectId
                ? onStopSong()
                : onPlaySong(project);
            }}
          >
            <div className={moduleStyles.control}>
              <FontAwesomeV6Icon
                iconName={project.id === currentProjectId ? 'stop' : 'play'}
                iconStyle="solid"
                className={moduleStyles.icon}
              />
            </div>
            <div className={moduleStyles.name}>{project.name}</div>
            <a
              href={`/projects/music/${project.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
            >
              <div className={moduleStyles.other}>
                <FontAwesomeV6Icon
                  iconName="arrow-up-right-from-square"
                  iconStyle="solid"
                  className={moduleStyles.icon}
                />
              </div>
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default MiniPlayerView;

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

import noteImage from '@cdo/static/music/music-note.png';

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
  const onPlaySong = useCallback(async (project: Channel) => {
    playerRef.current.stopSong();
    // Load code
    const projectSources = await sourcesStoreRef.current.load(project.id);
    workspaceRef.current.loadCode(JSON.parse(projectSources.source as string));

    // Compile song
    workspaceRef.current.compileSong({Sequencer: sequencerRef.current});

    // Execute compiled song
    // Sequence out all possible trigger events to preload sounds if necessary.
    sequencerRef.current.clear();
    workspaceRef.current.executeAllTriggers();
    const allTriggerEvents = sequencerRef.current.getPlaybackEvents();

    sequencerRef.current.clear();
    workspaceRef.current.executeCompiledSong();

    // If there is a pack ID, give the player its BPM and key.
    const currentLibrary = MusicLibrary.getInstance();
    const packId = project.labConfig?.music.packId || null;
    if (currentLibrary) {
      currentLibrary.setCurrentPackId(packId);
      playerRef.current.updateConfiguration(
        currentLibrary.getBPM(),
        currentLibrary.getKey()
      );
    }

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

  const getPackDetails = (packId: string) => {
    const packFolder = MusicLibrary.getInstance()?.getFolderForFolderId(packId);

    if (!packFolder) {
      return null;
    }

    return {
      name: packFolder.name,
      artist: packFolder.artist,
      color: packFolder.color,
    };
  };

  return (
    <div className={moduleStyles.miniMusicPlayer}>
      {projects.map(project => {
        const packId = project?.labConfig?.music.packId;
        const packDetails = packId ? getPackDetails(packId) : undefined;

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
            <div className={moduleStyles.pack}>
              {packId && (
                <img
                  src={noteImage}
                  className={moduleStyles.packImage}
                  style={{
                    background:
                      packDetails?.color &&
                      `radial-gradient(${packDetails.color}, #000`,
                  }}
                  alt=""
                />
              )}
            </div>

            <div className={moduleStyles.control}>
              <FontAwesomeV6Icon
                iconName={project.id === currentProjectId ? 'stop' : 'play'}
                iconStyle="solid"
                className={moduleStyles.icon}
              />
            </div>

            <div className={moduleStyles.body}>
              <div className={moduleStyles.name}>{project.name}</div>
              {packDetails && (
                <div className={moduleStyles.details}>
                  {packDetails.name} &bull; {packDetails.artist}
                </div>
              )}
            </div>

            <div className={moduleStyles.other}>
              <a
                href={`/projects/music/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className={moduleStyles.otherLink}
              >
                <FontAwesomeV6Icon
                  iconName="arrow-up-right-from-square"
                  iconStyle="solid"
                  className={moduleStyles.icon}
                />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MiniPlayerView;

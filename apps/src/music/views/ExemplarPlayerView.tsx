import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import AnalyticsReporter from '@cdo/apps/music/analytics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {Source} from '../../lab2/types';
import {installFunctionBlocks} from '../blockly/blockUtils';
import MusicBlocklyWorkspace from '../blockly/MusicBlocklyWorkspace';
import {setUpBlocklyForMusicLab} from '../blockly/setup';
import {BlockMode, DEFAULT_PACK} from '../constants';
import MusicLibrary from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';
import Simple2Sequencer from '../player/sequencer/Simple2Sequencer';

import moduleStyles from './MiniMusicPlayer.module.scss';

interface ExemplarPlayerViewProps {
  source: Source;
  packId: string;
  libraryName: string;
  title: string;
}

const ExemplarPlayerView: React.FunctionComponent<ExemplarPlayerViewProps> = ({
  source,
  packId,
  libraryName,
  title,
}) => {
  const playerRef = useRef<MusicPlayer | null>(null);
  if (playerRef.current === null) {
    playerRef.current = new MusicPlayer();
  }
  const workspaceRef = useRef<MusicBlocklyWorkspace>(
    new MusicBlocklyWorkspace()
  );
  const simple2SequencerRef = useRef<Simple2Sequencer>(new Simple2Sequencer());
  const analyticsReporter = useRef<AnalyticsReporter>(new AnalyticsReporter());
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const {userId, userType, signInState} = useAppSelector(
    state => state.currentUser
  );

  // Setup library and workspace, and analyticsReporter on mount
  const onMount = useCallback(async () => {
    setUpBlocklyForMusicLab();
    workspaceRef.current.initHeadless();
    await MusicLibrary.loadLibrary(libraryName);
    setIsLoading(false);
    await analyticsReporter.current.startSession();
  }, [analyticsReporter, libraryName]);

  useEffect(() => {
    onMount();
  }, [onMount]);

  useEffect(() => {
    analyticsReporter.current.setUserProperties(userId, userType, signInState);
  }, [userId, userType, signInState]);

  // This is the main function that is called when a song is played in the exemplar
  // player oads code from the server, compiles the song, executes it to generate
  // events, and then plays the events.
  // Optimization: cache code and/or compiled song after played once.
  const onPlaySong = useCallback(async (source: Source, packId: string) => {
    installFunctionBlocks(BlockMode.SIMPLE2);

    // Determine which sequencer reference to use based on blockMode
    const sequencerRef = simple2SequencerRef;

    playerRef.current?.stopSong();

    // If there is a pack ID, give the player its BPM and key.
    const currentLibrary = MusicLibrary.getInstance();
    if (currentLibrary) {
      currentLibrary.setCurrentPackId(packId);
      playerRef.current?.updateConfiguration(
        currentLibrary.getBPM(),
        currentLibrary.getKey()
      );
    }

    // Load code
    workspaceRef.current.loadCode(source);

    // Compile song
    workspaceRef.current.compileSong(
      {Sequencer: sequencerRef.current},
      BlockMode.SIMPLE2
    );

    // Execute compiled song
    // Sequence out all possible trigger events to preload sounds if necessary.
    sequencerRef.current.clear();
    workspaceRef.current.executeAllTriggers();
    const allTriggerEvents = sequencerRef.current.getPlaybackEvents();

    sequencerRef.current.clear();
    workspaceRef.current.executeCompiledSong();

    // Preload sounds in player
    await playerRef.current?.preloadSounds(
      [...allTriggerEvents, ...sequencerRef.current.getPlaybackEvents()],
      () => {}
    );

    // Play sounds
    playerRef.current?.playSong(sequencerRef.current.getPlaybackEvents());
    setIsPlaying(true);
  }, []);

  const onStopSong = useCallback(async () => {
    playerRef.current?.stopSong();
    setIsPlaying(false);
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
      image: MusicLibrary.getInstance()?.getPackImageUrl(packId),
    };
  };

  const packDetails = packId ? getPackDetails(packId) : undefined;
  return (
    <div className={moduleStyles.miniMusicPlayer}>
      <div
        className={moduleStyles.entry}
        key={'exemplar-player'}
        onClick={() => {
          isPlaying ? onStopSong() : onPlaySong(source, packId);
        }}
      >
        <div
          className={classNames(
            moduleStyles.pack,
            isPlaying && moduleStyles.packPlaying
          )}
        >
          <img
            className={moduleStyles.packImage}
            // The exemplar player always uses the default pack image to reduce distraction.
            src={getPackDetails(DEFAULT_PACK)?.image}
            alt=""
            draggable={false}
          />
        </div>

        <div className={moduleStyles.control}>
          <FontAwesomeV6Icon
            iconName={isPlaying ? 'stop' : 'play'}
            iconStyle="solid"
            className={moduleStyles.icon}
          />
        </div>

        <div className={moduleStyles.body}>
          <div className={moduleStyles.name}>{title}</div>
          {packDetails && (
            <div className={moduleStyles.details}>
              {packDetails.name} &bull; {packDetails.artist}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExemplarPlayerView;

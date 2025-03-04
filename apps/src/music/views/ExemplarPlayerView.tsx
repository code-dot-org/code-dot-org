import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {Source} from '../../lab2/types';
import MusicBlocklyWorkspace from '../blockly/MusicBlocklyWorkspace';
import {BlockMode, DEFAULT_PACK} from '../constants';
import MusicLibrary from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';
import Simple2Sequencer from '../player/sequencer/Simple2Sequencer';
import {setPlayerContext, setExemplarPlaybackEvents} from '../redux/musicRedux';

import moduleStyles from './ExemplarPlayer.module.scss';

interface ExemplarPlayerViewProps {
  source: Source;
  title: string;
  labSetPlaying: (playing: boolean) => void;
  packId: string | null;
}

const ExemplarPlayerView: React.FunctionComponent<ExemplarPlayerViewProps> = ({
  source,
  title,
  labSetPlaying,
  packId,
}) => {
  const dispatch = useAppDispatch();
  const playerContext = useAppSelector(state => state.music.playerContext);

  const playerRef = useRef<MusicPlayer | null>(null);
  if (playerRef.current === null) {
    playerRef.current = new MusicPlayer();
  }
  const workspaceRef = useRef<MusicBlocklyWorkspace>(
    new MusicBlocklyWorkspace()
  );
  const simple2SequencerRef = useRef<Simple2Sequencer>(new Simple2Sequencer());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // Immediately load the library and source, then compile the song.
  const onMount = useCallback(async () => {
    const currentLibrary = MusicLibrary.getInstance();
    if (currentLibrary) {
      currentLibrary.setCurrentPackId(packId);
      playerRef.current?.updateConfiguration(
        currentLibrary.getBPM(),
        currentLibrary.getKey()
      );
    }
    workspaceRef.current.initHeadless();

    workspaceRef.current.loadCode(source);
    workspaceRef.current.compileSong(
      {Sequencer: simple2SequencerRef.current},
      BlockMode.SIMPLE2
    );

    // Clear any prior events and execute triggers to prepare playback.
    simple2SequencerRef.current.clear();
    workspaceRef.current.executeAllTriggers();
    simple2SequencerRef.current.clear();
    workspaceRef.current.executeCompiledSong();
    const playbackEvents = simple2SequencerRef.current.getPlaybackEvents();
    dispatch(setExemplarPlaybackEvents(playbackEvents));
  }, [dispatch, packId, source]);

  useEffect(() => {
    onMount();
  }, [onMount]);

  // Uses the already compiled song to preload sounds and play it.
  const onPlaySong = useCallback(async () => {
    Blockly.getMainWorkspace().hideChaff();
    labSetPlaying(false);
    playerRef.current?.stopSong();

    const allTriggerEvents = simple2SequencerRef.current.getPlaybackEvents();

    // Preload sounds and then play the song using the compiled events.
    await playerRef.current?.preloadSounds(
      [...allTriggerEvents, ...simple2SequencerRef.current.getPlaybackEvents()],
      () => {}
    );
    playerRef.current?.playSong(
      simple2SequencerRef.current.getPlaybackEvents()
    );

    dispatch(setPlayerContext('exemplar'));
    setIsPlaying(true);
  }, [dispatch, labSetPlaying]);

  // Stop the exemplar song, updating Redux and local state.
  const onStopSong = useCallback(() => {
    if (playerContext === 'exemplar') {
      playerRef.current?.stopSong();
    }
    dispatch(setPlayerContext(null));
    setIsPlaying(false);
  }, [playerContext, dispatch]);

  useEffect(() => {
    if (playerContext !== 'exemplar' && isPlaying) {
      onStopSong();
    }
  }, [playerContext, isPlaying, onStopSong]);

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

  return (
    <div className={moduleStyles.exemplarPlayer}>
      <div
        className={moduleStyles.entry}
        key={'exemplar-player'}
        onClick={() => {
          isPlaying ? onStopSong() : onPlaySong();
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
        </div>
      </div>
    </div>
  );
};

export default ExemplarPlayerView;

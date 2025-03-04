import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {DEFAULT_PACK} from '../constants';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import MusicLibrary from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';
import Simple2Sequencer from '../player/sequencer/Simple2Sequencer';
import {setIsPlaying} from '../redux/musicRedux';

import moduleStyles from './ExemplarPlayer.module.scss';

interface ExemplarPlayerViewProps {
  getPlaybackEvents: () => PlaybackEvent[];
  title: string;
  packId: string | null;
}

const ExemplarPlayerView: React.FunctionComponent<ExemplarPlayerViewProps> = ({
  getPlaybackEvents,
  title,
  packId,
}) => {
  const dispatch = useAppDispatch();
  const isPlaying = useAppSelector(state => state.music.isPlaying);

  const playerRef = useRef<MusicPlayer | null>(null);
  if (playerRef.current === null) {
    playerRef.current = new MusicPlayer();
  }
  const simple2SequencerRef = useRef<Simple2Sequencer>(new Simple2Sequencer());
  const [exemplarIsPlaying, setExemplarIsPlaying] = useState<boolean>(false);
  // Adjust the packId and preload sounds.
  const onMount = useCallback(async () => {
    const currentLibrary = MusicLibrary.getInstance();
    if (currentLibrary) {
      currentLibrary.setCurrentPackId(packId);
      playerRef.current?.updateConfiguration(
        currentLibrary.getBPM(),
        currentLibrary.getKey()
      );
    }

    // Clear any prior events to prepare playback.
    simple2SequencerRef.current.clear();
    await playerRef.current?.preloadSounds(getPlaybackEvents(), () => {});
  }, [packId, getPlaybackEvents]);

  useEffect(() => {
    onMount();
  }, [onMount]);

  // Uses the already compiled song to preload sounds and play it.
  const onPlaySong = useCallback(async () => {
    Blockly.getMainWorkspace().hideChaff();
    dispatch(setIsPlaying(false));
    playerRef.current?.stopSong();

    // Play the song using the compiled events.
    playerRef.current?.playSong(getPlaybackEvents());

    setExemplarIsPlaying(true);
  }, [dispatch, getPlaybackEvents]);

  // Stop the exemplar song, updating Redux and local state.
  const onStopSong = useCallback(() => {
    if (!isPlaying) {
      // If the player was stopped by the Run button, we do not want to interfere with
      // MusicLabView's control of the player.
      playerRef.current?.stopSong();
    }
    setExemplarIsPlaying(false);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && exemplarIsPlaying) {
      onStopSong();
    }
  }, [isPlaying, exemplarIsPlaying, onStopSong]);

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
          exemplarIsPlaying ? onStopSong() : onPlaySong();
        }}
      >
        <div
          className={classNames(
            moduleStyles.pack,
            exemplarIsPlaying && moduleStyles.packPlaying
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
            iconName={exemplarIsPlaying ? 'stop' : 'play'}
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

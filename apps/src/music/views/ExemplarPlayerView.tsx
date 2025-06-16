import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useCallback, useContext, useEffect, useState} from 'react';

import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {DEFAULT_PACK} from '../constants';
import {AnalyticsContext} from '../context';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import MusicLibrary from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';
import {setIsPlaying} from '../redux/musicRedux';

import moduleStyles from './ExemplarPlayer.module.scss';
interface ExemplarPlayerViewProps {
  playbackEvents: PlaybackEvent[];
  title: string;
  player: MusicPlayer;
  insideInstructions: boolean;
}

const ExemplarPlayerView: React.FunctionComponent<ExemplarPlayerViewProps> = ({
  playbackEvents,
  title,
  player,
  insideInstructions,
}) => {
  const dispatch = useAppDispatch();
  const isPlaying = useAppSelector(state => state.music.isPlaying);
  const [exemplarIsPlaying, setExemplarIsPlaying] = useState<boolean>(false);
  const analyticsReporter = useContext(AnalyticsContext);

  const onMount = useCallback(async () => {
    await player.preloadSounds(playbackEvents, () => {});
  }, [player, playbackEvents]);

  useEffect(() => {
    onMount();
  }, [onMount]);

  // Play the already compiled song with the pre-loaded sounds.
  const onPlaySong = useCallback(async () => {
    Blockly.getMainWorkspace().hideChaff();
    // Stop the main lab view player.
    dispatch(setIsPlaying(false));
    player.stopSong();

    // Since the player is shared, it should already have the correct configuration.
    // Play the song using the compiled events.
    player.playSong(playbackEvents);

    setExemplarIsPlaying(true);
  }, [dispatch, player, playbackEvents]);

  // Stop the exemplar song, updating Redux and local state.
  const onStopSong = useCallback(() => {
    if (!isPlaying) {
      // If the player was stopped by the Run button, we do not want to interfere with
      // MusicLabView's control of the player.
      player.stopSong();
    }
    setExemplarIsPlaying(false);
  }, [isPlaying, player]);

  useLifecycleNotifier(LifecycleEvent.LevelChangeRequested, () => {
    if (exemplarIsPlaying) {
      onStopSong();
    }
  });

  const onPress = () => {
    const action = exemplarIsPlaying ? 'stop' : 'play';
    analyticsReporter?.onButtonClicked(`exemplar-player-${action}`, {
      title,
    });
    exemplarIsPlaying ? onStopSong() : onPlaySong();
  };

  useEffect(() => {
    if (isPlaying && exemplarIsPlaying) {
      onStopSong();
    }
  }, [isPlaying, exemplarIsPlaying, onStopSong]);

  // The exemplar player always uses the default pack image to reduce distraction.
  const packImage = MusicLibrary.getInstance()?.getPackImageUrl(DEFAULT_PACK);

  return (
    <div
      className={classNames(
        moduleStyles.exemplarPlayer,
        insideInstructions && moduleStyles.exemplarPlayerInsideInstructions
      )}
    >
      <div
        className={moduleStyles.entry}
        key={'exemplar-player'}
        role="button" // Makes the div behave like a button for accessibility
        tabIndex={0}
        onClick={onPress}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            onPress();
          }
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
            src={packImage}
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

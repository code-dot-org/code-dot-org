import * as Blockly from 'blockly/core';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import type {FunctionComponent} from 'react';
import {useCallback, useContext, useEffect, useState} from 'react';

import {useLifecycleNotifier} from '@code-dot-org/lab/hooks';
import {LifecycleEvent} from '@code-dot-org/lab';
import {useAppDispatch, useAppSelector} from '../../redux/store';

import {DEFAULT_PACK} from '../../constants';
import {AnalyticsContext} from '../../contexts';
import type {PlaybackEvent} from '../../player/interfaces/PlaybackEvent';
import MusicLibrary from '../../player/MusicLibrary';
import MusicPlayer from '../../player/MusicPlayer';
import {setIsPlaying} from '../../redux/musicSlice';

import moduleStyles from './exemplarPlayer.module.scss';
interface ExemplarPlayerViewProps {
  playbackEvents: PlaybackEvent[];
  title: string;
  player: MusicPlayer;
  insideInstructions: boolean;
}

const ExemplarPlayerView: FunctionComponent<ExemplarPlayerViewProps> = ({
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
    (Blockly.getMainWorkspace() as Blockly.WorkspaceSvg).hideChaff();
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

    if (exemplarIsPlaying) {
      onStopSong();
    } else {
      onPlaySong();
    }
  };

  useEffect(() => {
    if (isPlaying && exemplarIsPlaying) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: stop exemplar when main player starts
      onStopSong();
    }
  }, [isPlaying, exemplarIsPlaying, onStopSong]);

  // The exemplar player always uses the default pack image to reduce distraction.
  const packImage = MusicLibrary.getInstance()?.getPackImageUrl(DEFAULT_PACK);

  return (
    <div
      className={classNames(
        moduleStyles.exemplarPlayer,
        insideInstructions && moduleStyles.exemplarPlayerInsideInstructions,
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
            exemplarIsPlaying && moduleStyles.packPlaying,
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

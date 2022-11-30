import React, {useEffect, useState, useRef, useCallback} from 'react';
import PropTypes from 'prop-types';
import {useFetch} from '../util/useFetch';
import AnalyticsReporter from './analytics/AnalyticsReporter';
import MusicBlocklyWorkspace from './blockly/MusicBlocklyWorkspace';
import {AnalyticsContext, BaseUrlContext, PlayerUtilsContext} from './context';
import MusicPlayer from './player/MusicPlayer';
import StatelessMusicView from './StatelessMusicView';
import {getStore} from '@cdo/apps/redux';
import {connect, Provider} from 'react-redux';
import queryString from 'query-string';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import Globals from './globals';
import {setCurrentAudioElapsedTime, setSoundEvents} from './musiclabRedux';

const DEFAULT_GROUP_NAME = 'all';
const baseUrl = 'https://curriculum.code.org/media/musiclab/';

const UnconnectedMusicLabView = ({
  userId,
  userType,
  signInState,
  setCurrentAudioElapsedTime,
  setSoundEvents
}) => {
  // Refs
  const playerRef = useRef(new MusicPlayer());
  const reporterRef = useRef(new AnalyticsReporter());
  const workspaceRef = useRef(new MusicBlocklyWorkspace());
  const timerIdRef = useRef(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [allSounds, setAllSounds] = useState([]);

  let parameters = queryString.parse(location.search);
  const libraryFilename = parameters['library']
    ? `music-library-${parameters['library']}.json`
    : 'music-library.json';

  const {data} = useFetch(baseUrl + libraryFilename, null, [parameters]);
  const library = data;

  // const startTimer = () => {
  //   stopTimer();
  //   timerIdRef.current = setInterval(
  //     () =>
  //       setCurrentAudioElapsedTime(
  //         playerRef.current.getCurrentAudioElapsedTime()
  //       ),
  //     1000 / 30
  //   );
  // };

  // const stopTimer = () => {
  //   if (timerIdRef.current) {
  //     clearInterval(timerIdRef.current);
  //     timerIdRef.current = null;
  //   }
  // };

  const clearCode = () => {
    workspaceRef.current.resetCode();

    stopSong();

    playerRef.current.clearAllSoundEvents();
  };

  const executeSong = () => {
    workspaceRef.current.executeSong({
      MusicPlayer: playerRef.current
    });
    setSoundEvents(playerRef.current.getSoundEvents());
  };

  const playSong = () => {
    playerRef.current.stopSong();

    // Clear the events list of when_run sounds, because it will be
    // populated next.
    playerRef.current.clearWhenRunEvents();
    executeSong();
    playerRef.current.playSong();
    setIsPlaying(true);

    console.log('playSong', Blockly.getWorkspaceCode());
  };

  const stopSong = () => {
    playerRef.current.stopSong();

    // Clear the events list, and hence the visual timeline, of any
    // user-triggered sounds.
    playerRef.current.clearTriggeredEvents();

    setIsPlaying(false);
    setSoundEvents(playerRef.current.getSoundEvents());
    setCurrentAudioElapsedTime(0);
  };

  const setPlaying = play => {
    if (play) {
      playSong();
    } else {
      stopSong();
    }
  };

  const playTrigger = useCallback(
    id => {
      if (!isPlaying) {
        return;
      }
      reporterRef.current.onButtonClicked('trigger', {id});
      workspaceRef.current.executeTrigger(id);
      setSoundEvents(playerRef.current.getSoundEvents());
    },
    [isPlaying]
  );

  const onBlockSpaceChange = e => {
    // A drag event can leave the blocks in a temporarily unusable state,
    // e.g. when a disabled variable is dragged into a slot, it can still
    // be disabled.
    // A subsequent non-drag event should arrive and the blocks will be
    // usable then.
    // It's possible that other events should similarly be ignored here.
    if (e.type === Blockly.blockly_.Events.BLOCK_DRAG) {
      playerRef.current.stopAndCancelPreviews();
      return;
    }

    // Stop all when_run sounds that are still to play, because if they
    // are still valid after the when_run code is re-executed, they
    // will be scheduled again.
    playerRef.current.stopAllSoundsStillToPlay();

    // Also clear all when_run sounds from the events list, because it
    // will be recreated in its entirely when the when_run code is
    // re-executed.
    playerRef.current.clearWhenRunEvents();

    executeSong();

    console.log('onBlockSpaceChange', Blockly.getWorkspaceCode());

    reporterRef.current.onBlocksUpdated(workspaceRef.current.getAllBlocks());
    workspaceRef.current.saveCode();
  };

  useEffect(() => {
    reporterRef.current.startSession().then(() => {
      reporterRef.current.setUserProperties(userId, userType, signInState);
    });

    window.addEventListener('beforeunload', () =>
      reporterRef.current.endSession()
    );
  }, []);

  useEffect(() => {
    if (!library) {
      return;
    }

    workspaceRef.current.init(
      document.getElementById('blockly-div'),
      onBlockSpaceChange
    );

    playerRef.current.initialize(library);
    // setInterval(updateTimer, 1000 / 30);

    setAllSounds(
      library.groups.find(group => group.id === DEFAULT_GROUP_NAME)?.folders
    );

    Globals.setLibrary(library);
  }, [library]);

  useEffect(() => {
    Globals.setPlayer(playerRef.current);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      timerIdRef.current = setInterval(
        () =>
          setCurrentAudioElapsedTime(
            playerRef.current.getCurrentAudioElapsedTime()
          ),
        1000 / 30
      );
    } else {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    }
  }, [isPlaying]);

  return (
    <AnalyticsContext.Provider value={reporterRef.current}>
      <BaseUrlContext.Provider value={baseUrl}>
        <PlayerUtilsContext.Provider
          value={{
            getCurrentMeasure: () => playerRef.current.getCurrentMeasure(),
            convertMeasureToSeconds: measure =>
              playerRef.current.convertMeasureToSeconds(measure)
          }}
        >
          <StatelessMusicView
            isPlaying={isPlaying}
            playTrigger={playTrigger}
            setPlaying={setPlaying}
            clearCode={clearCode}
            blocklyDivId={'blockly-div'}
            allSounds={allSounds}
            resizeBlockly={() => workspaceRef.current.resizeBlockly()}
          />
        </PlayerUtilsContext.Provider>
      </BaseUrlContext.Provider>
    </AnalyticsContext.Provider>
  );
};

UnconnectedMusicLabView.propTypes = {
  userId: PropTypes.number,
  userType: PropTypes.string,
  signInState: PropTypes.oneOf(Object.values(SignInState)),
  setCurrentAudioElapsedTime: PropTypes.func.isRequired,
  setSoundEvents: PropTypes.func.isRequired
};

const MusicLabView = connect(
  state => ({
    userId: state.currentUser.userId,
    userType: state.currentUser.userType,
    signInState: state.currentUser.signInState
  }),
  dispatch => ({
    setCurrentAudioElapsedTime: time =>
      dispatch(setCurrentAudioElapsedTime(time)),
    setSoundEvents: events => dispatch(setSoundEvents(events))
  })
)(UnconnectedMusicLabView);

export default () => (
  <Provider store={getStore()}>
    <MusicLabView />
  </Provider>
);

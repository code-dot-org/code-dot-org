import React, {useCallback, useEffect, useRef, useState} from 'react';
import {TypedUseSelectorHook, useSelector} from 'react-redux';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import AgeDialog from '@cdo/apps/templates/AgeDialog';
import {CurrentUserState} from '@cdo/apps/templates/CurrentUserState';
import {getFilterStatus} from '../../songs';
import moduleStyles from './dance-view.module.scss';
import {SongSelector} from '../../DanceVisualizationColumn';
import {
  DanceState,
  initSongs,
  reducers,
  setIsRunning,
  setRunIsStarting,
  setSong,
} from '../../danceRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import Lab2MetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import {isReadOnlyWorkspace, LabState} from '@cdo/apps/lab2/lab2Redux';
import {DanceLevelProperties, DanceProjectSources} from '../../types';
import {registerReducers} from '@cdo/apps/redux';
import ProgramExecutor from '../ProgramExecutor';
import {saveReplayLog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import DanceControls from './DanceControls';
import classNames from 'classnames';
const commonI18n = require('@cdo/locale');

const DANCE_VISUALIZATION_ID = 'dance-visualization';
const BLOCKLY_DIV_ID = 'dance-blockly-div';

const useTypedSelector: TypedUseSelectorHook<{
  currentUser: CurrentUserState;
  dance: DanceState;
  lab: LabState & {
    levelProperties?: DanceLevelProperties;
    initialSources?: DanceProjectSources;
  };
}> = useSelector;

registerReducers(reducers);

/**
 * Renders the Lab2 version of Dance Lab. This separate container
 * allows us to support both Lab2 and legacy Dance.
 */
const DanceView: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  // Get properties from redux store.
  const useRestrictedSongs = useTypedSelector(
    state => state.lab.levelProperties?.useRestrictedSongs || false
  );
  const defaultSong = useTypedSelector(
    state => state.lab.levelProperties?.defaultSong
  );
  const projectSelectedSong = useTypedSelector(
    state => state.lab.initialSources?.selectedSong
  );
  const isProjectLevel = useTypedSelector(
    state => state.lab.levelProperties?.isProjectLevel || false
  );
  const freePlay = useTypedSelector(
    state => state.lab.levelProperties?.freePlay || false
  );
  const isRunning = useTypedSelector(state => state.dance.isRunning);
  const userType = useTypedSelector(state => state.currentUser.userType);
  const under13 = useTypedSelector(state => state.currentUser.under13);
  const selectedSong = useTypedSelector(state => state.dance.selectedSong);
  const songData = useTypedSelector(state => state.dance.songData);
  const readonlyWorkspace = useSelector(isReadOnlyWorkspace);
  const customHelperLibrary = useTypedSelector(
    state => state.lab.levelProperties?.customHelperLibrary
  );
  const currentSongMetadata = useTypedSelector(
    state => state.dance.currentSongMetadata
  );
  const validationCode = useTypedSelector(
    state => state.lab.levelProperties?.validationCode
  );
  const runQueued = useTypedSelector(state => state.dance.runQueued);

  // Local state
  const [filterOn, setFilterOn] = useState<boolean>(
    getFilterStatus(userType, under13)
  );

  // Refs
  const programExecutor = useRef<ProgramExecutor | null>(null);

  // Callbacks
  const onAuthError = (songId: string) => {
    Lab2MetricsReporter.logWarning({
      message: 'Error loading song',
      songId,
    });
  };

  const turnOffFilter = useCallback(() => setFilterOn(false), []);

  const onSetSong = useCallback(
    (songId: string) => {
      dispatch(setSong({songId, onAuthError}));
    },
    [dispatch]
  );

  const runProgram = useCallback(async () => {
    if (!programExecutor.current || !currentSongMetadata) {
      return;
    }

    // Set the runIsStartingFlag to true while the run function is executing,
    // and set the isRunning flag to true once the run actually starts.
    dispatch(setRunIsStarting(true));
    await programExecutor.current.execute(currentSongMetadata);
    dispatch(setRunIsStarting(false));
    dispatch(setIsRunning(true));
  }, [programExecutor, currentSongMetadata, dispatch]);

  const resetProgram = useCallback(() => {
    programExecutor.current?.reset();
    dispatch(setIsRunning(false));
  }, [programExecutor, dispatch]);

  const onPuzzleComplete = useCallback(
    (result: boolean, message: string) => {
      resetProgram();
      // TODO: Handle puzzle complete.
      console.log(`onPuzzleComplete! pass?: ${result} message: ${message}`);
    },
    [resetProgram]
  );

  const onEventsChanged = () => {
    // TODO: Save project thumbnail when events change.
    console.log('onEventsChanged');
  };

  const previewProgram = useCallback(() => {
    programExecutor.current?.preview();
  }, [programExecutor]);

  // useEffect hooks

  // Initialize song manifest and load initial song when level loads.
  useEffect(() => {
    dispatch(
      initSongs({
        useRestrictedSongs,
        selectSongOptions: {
          defaultSong,
          selectedSong: projectSelectedSong,
          isProjectLevel,
          freePlay,
        },
        onAuthError,
      })
    );
  }, [
    isProjectLevel,
    freePlay,
    defaultSong,
    projectSelectedSong,
    useRestrictedSongs,
    dispatch,
  ]);

  // Initialize program executor when level loads.
  useEffect(() => {
    // record a replay log (and generate a video) for both project levels and any
    // course levels that have sharing enabled
    const recordReplayLog = isProjectLevel || freePlay;
    programExecutor.current = new ProgramExecutor(
      DANCE_VISUALIZATION_ID,
      onPuzzleComplete,
      readonlyWorkspace,
      recordReplayLog,
      customHelperLibrary,
      validationCode,
      onEventsChanged
    );

    if (recordReplayLog) {
      dispatch(saveReplayLog(programExecutor.current.getReplayLog()));
    }

    return () => {
      programExecutor.current?.destroy();
    };
  }, [
    dispatch,
    customHelperLibrary,
    readonlyWorkspace,
    freePlay,
    isProjectLevel,
    onPuzzleComplete,
    validationCode,
  ]);

  // TODO: Don't show AgeDialog if in share mode. Share view is currently
  // not supported for Lab2.
  return (
    <div id="dance-lab" className={moduleStyles.danceLab}>
      <AgeDialog turnOffFilter={turnOffFilter} />
      <div className={moduleStyles.visualizationArea}>
        <div className={moduleStyles.visualizationColumn}>
          <SongSelector
            enableSongSelection={!isRunning}
            setSong={onSetSong}
            selectedSong={selectedSong}
            songData={songData}
            filterOn={filterOn}
          />
          <div
            id={DANCE_VISUALIZATION_ID}
            className={moduleStyles.visualization}
            onClick={previewProgram} // Temporary to test out preview functionality. Remove when blockly is setup.
          >
            <DanceLoading show={runQueued} />
          </div>
        </div>
        <DanceControls onRun={runProgram} onReset={resetProgram} />
      </div>
      <div className={moduleStyles.workArea}>
        <PanelContainer
          id="dance-instructions-panel"
          headerText={commonI18n.instructions()}
          className={moduleStyles.instructionsArea}
        >
          <Instructions layout="horizontal" />
        </PanelContainer>
        <PanelContainer
          id="dance-workspace-panel"
          headerText={commonI18n.workspaceHeaderShort()}
          className={moduleStyles.workspaceArea}
        >
          <div id={BLOCKLY_DIV_ID} />
        </PanelContainer>
      </div>
    </div>
  );
};

// Loading container
const DanceLoading: React.FunctionComponent<{show: boolean}> = ({show}) => {
  return (
    <div
      className={classNames(
        moduleStyles.loadingContainer,
        show && moduleStyles.loadingContainerShow
      )}
    >
      <img
        src="//curriculum.code.org/images/DancePartyLoading.gif"
        className={moduleStyles.loadingGif}
      />
    </div>
  );
};

export default DanceView;

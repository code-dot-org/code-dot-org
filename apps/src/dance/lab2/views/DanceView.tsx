import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {saveReplayLog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import SongSelector from '@cdo/apps/dance/SongSelector';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getIsShareView} from '@cdo/apps/lab2/projects/utils';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {LabProps} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {registerReducers} from '@cdo/apps/redux';
import AgeDialog from '@cdo/apps/templates/AgeDialog';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {installCommonBlocks, installDanceBlocks} from '../../blockly/setup';
import {
  initSongs,
  reducers,
  setHasRun,
  setIsRunning,
  setRunIsStarting,
  setSong,
} from '../../danceRedux';
import {getFilterStatus} from '../../songs';
import {DanceLevelProperties, DanceProjectSources} from '../../types';
import danceI18n from '../locale';
import ProgramExecutor from '../ProgramExecutor';

import DanceControls from './DanceControls';

import moduleStyles from './dance-view.module.scss';

const DANCE_VISUALIZATION_ID = 'dance-visualization';
const BLOCKLY_DIV_ID = 'dance-blockly-div';

registerReducers(reducers);

/**
 * Renders the Lab2 version of Dance Lab. This separate container
 * allows us to support both Lab2 and legacy Dance.
 */
const DanceView: React.FunctionComponent<
  LabProps<DanceLevelProperties, DanceProjectSources>
> = ({initialSources, levelProperties}) => {
  const dispatch = useAppDispatch();

  const isRunning = useAppSelector(state => state.dance.isRunning);
  const userType = useAppSelector(state => state.currentUser.userType);
  const under13 = useAppSelector(state => state.currentUser.under13);
  const selectedSong = useAppSelector(state => state.dance.selectedSong);
  const songData = useAppSelector(state => state.dance.songData);
  const readonlyWorkspace = useAppSelector(isReadOnlyWorkspace);
  const currentSongMetadata = useAppSelector(
    state => state.dance.currentSongMetadata
  );
  const hasRun = useAppSelector(state => state.dance.hasRun);
  const isLoading = useAppSelector(state => state.dance.isLoading);

  const programExecutor = useRef<ProgramExecutor | null>(null);

  const [filterOn, setFilterOn] = useState<boolean>(
    getFilterStatus(userType, under13)
  );

  const onAuthError = (songId: string) => {
    // TODO: Show page error if necessary
    Lab2Registry.getInstance().getMetricsReporter().logWarning({
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
    await programExecutor.current.execute('', currentSongMetadata);
    dispatch(setRunIsStarting(false));
    dispatch(setIsRunning(true));
    dispatch(setHasRun(true));
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

  useEffect(() => {
    installCommonBlocks(levelProperties.skin, levelProperties.isK1);
  }, [levelProperties.skin, levelProperties.isK1]);

  useEffect(() => {
    installDanceBlocks(levelProperties.sharedBlocks);
  }, [levelProperties.sharedBlocks]);

  // Reset hasRun flag when level changes
  useEffect(() => {
    dispatch(setHasRun(false));
  }, [levelProperties.id, dispatch]);

  // Initialize song manifest and load initial song when level loads.
  useEffect(() => {
    dispatch(
      initSongs({
        useRestrictedSongs: levelProperties.useRestrictedSongs || false,
        selectSongOptions: {
          defaultSong: levelProperties.defaultSong,
          selectedSong: initialSources?.selectedSong,
          isProjectLevel: levelProperties.isProjectLevel || false,
          freePlay: levelProperties.freePlay || false,
        },
        onAuthError,
      })
    );
  }, [levelProperties, initialSources, dispatch]);

  useEffect(() => {
    const {isProjectLevel, freePlay, customHelperLibrary, validationCode} =
      levelProperties;
    // record a replay log (and generate a video) for both project levels and any
    // course levels that have sharing enabled
    const recordReplayLog = isProjectLevel || freePlay || false;
    programExecutor.current = new ProgramExecutor(
      DANCE_VISUALIZATION_ID,
      onPuzzleComplete,
      readonlyWorkspace,
      recordReplayLog,
      Lab2Registry.getInstance().getMetricsReporter(),
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
    levelProperties,
    dispatch,
    programExecutor,
    onPuzzleComplete,
    readonlyWorkspace,
  ]);

  return (
    <div id="dance-lab" className={moduleStyles.danceLab}>
      {!getIsShareView() && <AgeDialog turnOffFilter={turnOffFilter} />}
      <ResourcePanel
        isRunning={isRunning}
        hasRun={hasRun}
        // Always passing true for now; update when Blockly workspace is set up.
        hasEdited={true}
        levelProperties={levelProperties}
        headerClassName={moduleStyles.panelHeader}
        className={moduleStyles.instructionsArea}
      />
      <div className={moduleStyles.divider} />
      <PanelContainer
        id="visualization"
        headerContent="Dance Party!"
        headerClassName={moduleStyles.panelHeader}
        className={moduleStyles.visualizationArea}
      >
        <div className={moduleStyles.visualizationColumn}>
          <SongSelector
            enableSongSelection={!isRunning}
            setSong={onSetSong}
            selectedSong={selectedSong}
            songData={songData}
            filterOn={filterOn}
            levelIsRunning={isRunning}
          />
          <div
            id={DANCE_VISUALIZATION_ID}
            className={moduleStyles.visualization}
          >
            <div
              className={classNames(
                moduleStyles.loading,
                isLoading && moduleStyles.loadingShow
              )}
            >
              <img
                src="//curriculum.code.org/images/DancePartyLoading.gif"
                className={moduleStyles.loadingGif}
                alt={danceI18n.dancePartyLoading()}
              />
            </div>
          </div>
          <DanceControls onRun={runProgram} onReset={resetProgram} />
        </div>
      </PanelContainer>
      <div className={moduleStyles.divider} />
      <PanelContainer
        id="dance-workspace-panel"
        headerContent={commonI18n.workspaceHeaderShort()}
        className={moduleStyles.workspaceArea}
        headerClassName={moduleStyles.panelHeader}
      >
        <div id={BLOCKLY_DIV_ID} />
      </PanelContainer>
    </div>
  );
};

export default DanceView;

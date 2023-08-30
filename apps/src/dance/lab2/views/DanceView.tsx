import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import AgeDialog from '@cdo/apps/templates/AgeDialog';
import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import moduleStyles from './dance-view.module.scss';
import {SongSelector} from '../../DanceVisualizationColumn';
import {DanceSongState, initSongs, reducers, setSong} from '../../redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {isReadOnlyWorkspace, LabState} from '@cdo/apps/lab2/lab2Redux';
import {DanceLevelProperties, DanceProjectSource} from '../../types';
import {registerReducers} from '@cdo/apps/redux';
import {commands} from '@cdo/apps/lib/util/audioApi';
import Sounds from '@cdo/apps/Sounds';
import DanceControls from './DanceControls';
import classNames from 'classnames';

const DANCE_VISUALIZATION_ID = 'danceVisualization';
const BLOCKLY_DIV_ID = 'danceBlocklyDiv';

registerReducers(reducers);

const DanceView: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const [filterOn, setFilterOn] = useState<boolean>(false);
  const isReadonly = useSelector(isReadOnlyWorkspace);
  const selectedSong = useSelector(
    (state: {songs: DanceSongState}) => state.songs.selectedSong
  );
  const useRestrictedSongs =
    useSelector(
      (state: {lab: LabState}) =>
        state.lab.levelProperties as DanceLevelProperties | undefined
    )?.useRestrictedSongs || false;
  const songData = useSelector(
    (state: {songs: DanceSongState}) => state.songs.songData
  );
  const currentSongMetadata = useSelector(
    (state: {songs: DanceSongState}) => state.songs.currentSongMetadata
  );
  const isRunning = useSelector(
    (state: {songs: DanceSongState}) => state.songs.isRunning
  );
  const runQueued = useSelector(
    (state: {songs: DanceSongState}) => state.songs.runQueued
  );
  const turnOffFilter = useCallback(() => setFilterOn(false), [setFilterOn]);

  const setSongCallback = useCallback(
    (songId: string) => {
      dispatch(
        setSong({
          songId,
          onAuthError: () => {
            console.log('error');
          },
        })
      );
    },
    [dispatch]
  );

  const isProjectLevel =
    useSelector(
      (state: {lab: LabState}) => state.lab.levelProperties?.isProjectLevel
    ) || false;

  const freePlay =
    useSelector(
      (state: {lab: LabState}) => state.lab.levelProperties?.freePlay
    ) || false;

  const defaultSong = useSelector(
    (state: {lab: LabState}) =>
      (state.lab.levelProperties as DanceLevelProperties | undefined)
        ?.defaultSong
  );

  const projectSelectedSong = useSelector(
    (state: {lab: LabState}) =>
      (state.lab.initialSources as DanceProjectSource | undefined)?.selectedSong
  );

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
        onAuthError: () => {
          // TODO error logging
          console.log('error');
        },
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

  const runProgram = useCallback(() => {
    if (currentSongMetadata) {
      commands.playSound({
        url: currentSongMetadata.file,
      });
    }
  }, [currentSongMetadata]);

  const resetProgram = useCallback(() => {
    Sounds.getSingleton().stopAllAudio();
  }, []);

  return (
    <div id="dance-lab" className={moduleStyles.danceLab}>
      {!isReadonly && <AgeDialog turnOffFilter={turnOffFilter} />}
      <PanelContainer
        id="dance-visualization-panel"
        headerText="Visualization"
        className={moduleStyles.visualizationArea}
      >
        <div className={moduleStyles.visualizationColumn}>
          <SongSelector
            enableSongSelection={!isRunning} // TODO: true only if not running
            setSong={setSongCallback}
            selectedSong={selectedSong}
            songData={songData}
            filterOn={filterOn}
          />
          <div
            id={DANCE_VISUALIZATION_ID}
            className={moduleStyles.visualization}
          >
            <DanceLoading show={runQueued} />
          </div>
        </div>
        <DanceControls onRun={runProgram} onReset={resetProgram} />
      </PanelContainer>
      <div className={moduleStyles.workArea}>
        <PanelContainer
          id="dance-instructions-panel"
          headerText="Instructions"
          className={moduleStyles.instructionsArea}
        >
          <Instructions layout="horizontal" />
        </PanelContainer>
        <PanelContainer
          id="dance-workspace-panel"
          headerText="Workspace"
          className={moduleStyles.workspaceArea}
        >
          <div id={BLOCKLY_DIV_ID}>{'blockly'}</div>
        </PanelContainer>
      </div>
    </div>
  );
};

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

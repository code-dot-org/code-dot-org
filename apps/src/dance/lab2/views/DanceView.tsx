import React, {useCallback, useEffect, useState} from 'react';
import {TypedUseSelectorHook, useSelector} from 'react-redux';

import SongSelector from '@cdo/apps/dance/SongSelector';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {registerReducers} from '@cdo/apps/redux';
import AgeDialog from '@cdo/apps/templates/AgeDialog';
import {CurrentUserState} from '@cdo/apps/templates/CurrentUserState';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {installCommonBlocks, installDanceBlocks} from '../../blockly/setup';
import {DanceState, initSongs, reducers, setSong} from '../../danceRedux';
import {getFilterStatus} from '../../songs';
import {DanceLevelProperties, DanceProjectSources} from '../../types';

import moduleStyles from './dance-view.module.scss';

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

  const sharedBlocks = useTypedSelector(
    state => state.lab.levelProperties?.sharedBlocks || undefined
  );

  const skin = useTypedSelector(
    state => state.lab.levelProperties?.skin || undefined
  );

  const isK1 = useTypedSelector(
    state => state.lab.levelProperties?.isK1 || false
  );

  const onAuthError = (songId: string) => {
    Lab2Registry.getInstance().getMetricsReporter().logWarning({
      message: 'Error loading song',
      songId,
    });
  };

  useEffect(() => {
    installCommonBlocks(skin, isK1);
  }, [skin, isK1]);

  useEffect(() => {
    installDanceBlocks(sharedBlocks);
  }, [sharedBlocks]);

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

  const userType = useTypedSelector(state => state.currentUser.userType);
  const under13 = useTypedSelector(state => state.currentUser.under13);
  const [filterOn, setFilterOn] = useState<boolean>(
    getFilterStatus(userType, under13)
  );
  const turnOffFilter = useCallback(() => setFilterOn(false), []);

  const selectedSong = useTypedSelector(state => state.dance.selectedSong);
  const songData = useTypedSelector(state => state.dance.songData);
  const onSetSong = useCallback(
    (songId: string) => {
      dispatch(setSong({songId, onAuthError}));
    },
    [dispatch]
  );

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
            levelIsRunning={isRunning}
          />
          <div
            id={DANCE_VISUALIZATION_ID}
            className={moduleStyles.visualization}
          />
        </div>
      </div>
      <div className={moduleStyles.workArea}>
        <PanelContainer
          id="dance-instructions-panel"
          headerContent={commonI18n.instructions()}
          className={moduleStyles.instructionsArea}
        >
          <Instructions layout="horizontal" />
        </PanelContainer>
        <PanelContainer
          id="dance-workspace-panel"
          headerContent={commonI18n.workspaceHeaderShort()}
          className={moduleStyles.workspaceArea}
        >
          <div id={BLOCKLY_DIV_ID} />
        </PanelContainer>
      </div>
    </div>
  );
};

export default DanceView;

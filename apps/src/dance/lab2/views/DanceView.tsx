import React, {useCallback, useEffect, useState} from 'react';

import SongSelector from '@cdo/apps/dance/SongSelector';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LabProps} from '@cdo/apps/lab2/types';
import InstructionsV2 from '@cdo/apps/lab2/views/components/Instructions/InstructionsV2';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {registerReducers} from '@cdo/apps/redux';
import AgeDialog from '@cdo/apps/templates/AgeDialog';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {installCommonBlocks, installDanceBlocks} from '../../blockly/setup';
import {initSongs, reducers, setSong} from '../../danceRedux';
import {getFilterStatus} from '../../songs';
import {DanceLevelProperties, DanceProjectSources} from '../../types';

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

  const onAuthError = (songId: string) => {
    Lab2Registry.getInstance().getMetricsReporter().logWarning({
      message: 'Error loading song',
      songId,
    });
  };

  useEffect(() => {
    installCommonBlocks(levelProperties.skin, levelProperties.isK1);
  }, [levelProperties.skin, levelProperties.isK1]);

  useEffect(() => {
    installDanceBlocks(levelProperties.sharedBlocks);
  }, [levelProperties.sharedBlocks]);

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

  const userType = useAppSelector(state => state.currentUser.userType);
  const under13 = useAppSelector(state => state.currentUser.under13);
  const [filterOn, setFilterOn] = useState<boolean>(
    getFilterStatus(userType, under13)
  );
  const turnOffFilter = useCallback(() => setFilterOn(false), []);

  const selectedSong = useAppSelector(state => state.dance.selectedSong);
  const songData = useAppSelector(state => state.dance.songData);
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
          <InstructionsV2
            layout="horizontal"
            isRunning={isRunning}
            // Always passing true for now; update when resuming work on Lab2 Dance.
            hasRun={true}
            hasEdited={true}
            levelProperties={levelProperties}
          />
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

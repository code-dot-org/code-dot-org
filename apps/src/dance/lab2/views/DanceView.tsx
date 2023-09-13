import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import AgeDialog, {getFilterStatus} from '@cdo/apps/templates/AgeDialog';
import {CurrentUserState} from '@cdo/apps/templates/CurrentUserState';
import React, {useCallback, useState} from 'react';
import {TypedUseSelectorHook, useSelector} from 'react-redux';
import moduleStyles from './dance-view.module.scss';
const commonI18n = require('@cdo/locale');

const DANCE_VISUALIZATION_ID = 'dance-visualization';
const BLOCKLY_DIV_ID = 'dance-blockly-div';

const useTypedSelector: TypedUseSelectorHook<{
  currentUser: CurrentUserState;
}> = useSelector;

/**
 * Renders the Lab2 version of Dance Lab. This separate container
 * allows us to support both Lab2 and legacy Dance.
 */
const DanceView: React.FunctionComponent = () => {
  const userType = useTypedSelector(state => state.currentUser.userType);
  const under13 = useTypedSelector(state => state.currentUser.under13);
  const [filterOn, setFilterOn] = useState<boolean>(
    getFilterStatus(userType, under13)
  );
  const turnOffFilter = useCallback(() => setFilterOn(false), []);

  // TODO: Don't show AgeDialog if in share mode. Share view is currently
  // not supported for Lab2.
  return (
    <div id="dance-lab" className={moduleStyles.danceLab}>
      <AgeDialog turnOffFilter={turnOffFilter} />
      <div className={moduleStyles.visualizationArea}>
        <div className={moduleStyles.visualizationColumn}>
          <div
            id={DANCE_VISUALIZATION_ID}
            className={moduleStyles.visualization}
          />
        </div>
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

export default DanceView;

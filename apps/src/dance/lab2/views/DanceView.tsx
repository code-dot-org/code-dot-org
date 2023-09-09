import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import React from 'react';
import moduleStyles from './dance-view.module.scss';
import commonI18n from '@cdo/locale';

const DANCE_VISUALIZATION_ID = 'dance-visualization';
const BLOCKLY_DIV_ID = 'dance-blockly-div';

/**
 * Renders the Lab2 version of Dance Lab. This separate container
 * allows us to support both Lab2 and legacy Dance.
 */
const DanceView: React.FunctionComponent = () => {
  return (
    <div id="dance-lab" className={moduleStyles.danceLab}>
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

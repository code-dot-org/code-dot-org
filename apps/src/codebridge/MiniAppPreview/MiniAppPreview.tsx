import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import ControlButtons from '@codebridge/Console/ControlButtons';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import NeighborhoodVisualization from '@cdo/apps/miniApps/neighborhood/NeighborhoodVisualization';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './mini-app-preview.module.scss';

const MiniAppPreview: React.FunctionComponent = () => {
  const {config} = useCodebridgeContext();
  const isHorizontal = config.activeGridLayout === 'horizontal';
  const miniApp = useAppSelector(state => state.lab.levelProperties?.miniApp);

  // need to inject Neighborhood.ts
  const miniAppComponent =
    miniApp === 'neighborhood' ? (
      <NeighborhoodVisualization
        fullIconPath={'/blockly/media/turtle/icons_white.png'}
      />
    ) : null;

  return (
    <PanelContainer
      id="codebridge-preview"
      headerContent={codebridgeI18n.preview()}
      leftHeaderContent={<ControlButtons />}
      className={
        isHorizontal
          ? moduleStyles.previewContainerHorizontal
          : moduleStyles.previewContainerVertical
      }
      headerClassName={moduleStyles.previewHeader}
    >
      {miniAppComponent}
    </PanelContainer>
  );
};

export default MiniAppPreview;

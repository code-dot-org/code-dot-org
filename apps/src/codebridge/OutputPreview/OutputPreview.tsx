import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import ControlButtons from '@codebridge/Console/ControlButtons';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import moduleStyles from './output-preview.module.scss';

interface OutputPreviewProps {
  innerComponent?: React.ReactNode;
}

const OutputPreview: React.FunctionComponent<OutputPreviewProps> = ({
  innerComponent,
}) => {
  const {config} = useCodebridgeContext();
  const isHorizontal = config.activeGridLayout === 'horizontal';

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
      {innerComponent}
    </PanelContainer>
  );
};

export default OutputPreview;

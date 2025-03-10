import React from 'react';

import MiniAppPreview from '@cdo/apps/codebridge/MiniAppPreview/MiniAppPreview';
import HorizontalOutput from '@cdo/apps/codebridge/Workspace/HorizontalOutput';

import moduleStyles from './share-view.module.scss';

interface ConsoleAndPreviewShareProps {
  consoleVisible: boolean;
  availableWidth: number;
}

const ConsoleAndPreviewShare: React.FunctionComponent<
  ConsoleAndPreviewShareProps
> = ({consoleVisible, availableWidth}) => {
  if (consoleVisible) {
    return (
      <HorizontalOutput
        height={800}
        width={availableWidth}
        setOutputHeight={() => {}}
      />
    );
  }

  return (
    <div className={moduleStyles.fullScreenPreview}>
      <MiniAppPreview
        showMaximizeButton={false}
        maximizeMiniApp={() => {}}
        minimizeMiniApp={() => {}}
        isMaximized={false}
      />
    </div>
  );
};

export default ConsoleAndPreviewShare;

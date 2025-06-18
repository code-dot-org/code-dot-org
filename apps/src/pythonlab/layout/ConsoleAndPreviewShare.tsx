import React from 'react';

import MiniAppPreview from '@cdo/apps/codebridge/MiniAppPreview/MiniAppPreview';
import HorizontalOutput from '@cdo/apps/codebridge/Workspace/HorizontalOutput';

interface ConsoleAndPreviewShareProps {
  consoleVisible: boolean;
  height: number;
  width: number;
}

const ConsoleAndPreviewShare: React.FunctionComponent<
  ConsoleAndPreviewShareProps
> = ({consoleVisible, height, width}) => {
  if (consoleVisible) {
    return (
      <HorizontalOutput
        height={height}
        width={width}
        setOutputHeight={() => {}}
      />
    );
  }

  return (
    <MiniAppPreview
      showMaximizeButton={false}
      maximizeMiniApp={() => {}}
      minimizeMiniApp={() => {}}
      isMaximized={false}
      handleScaling={true}
    />
  );
};

export default ConsoleAndPreviewShare;

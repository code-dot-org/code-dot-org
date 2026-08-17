import {getMiniAppTitle} from '@codebridge/utils';
import React from 'react';

import MiniAppPreview from '@cdo/apps/codebridge/MiniAppPreview/MiniAppPreview';
import HorizontalOutput from '@cdo/apps/codebridge/Workspace/HorizontalOutput';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

interface ConsoleAndPreviewShareProps {
  consoleVisible: boolean;
  height: number;
  width: number;
}

const ConsoleAndPreviewShare: React.FunctionComponent<
  ConsoleAndPreviewShareProps
> = ({consoleVisible, height, width}) => {
  const miniApp = useAppSelector(
    state => state.lab2Project.projectSources?.labConfig?.miniApp?.name
  );

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
      title={getMiniAppTitle(miniApp)}
    />
  );
};

export default ConsoleAndPreviewShare;

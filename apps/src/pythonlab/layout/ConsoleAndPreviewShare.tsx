import React, {useEffect, useState} from 'react';

import MiniAppPreview from '@cdo/apps/codebridge/MiniAppPreview/MiniAppPreview';
import HorizontalOutput from '@cdo/apps/codebridge/Workspace/HorizontalOutput';

import moduleStyles from './share-view.module.scss';

interface ConsoleAndPreviewShareProps {
  consoleVisible: boolean;
}

const ConsoleAndPreviewShare: React.FunctionComponent<
  ConsoleAndPreviewShareProps
> = ({consoleVisible}) => {
  const getAvailableOutputWidth = () => {
    return Math.max(window.innerWidth - 150, 400);
  };

  const [outputWidth, setOutputWidth] = useState(getAvailableOutputWidth());
  const [outputHeight, setOutputHeight] = useState(window.innerHeight);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setOutputWidth(getAvailableOutputWidth());
      setOutputHeight(window.innerHeight);
    });
    return () =>
      window.removeEventListener('resize', () => {
        setOutputWidth(getAvailableOutputWidth());
        setOutputHeight(window.innerHeight);
      });
  }, []);

  if (consoleVisible) {
    return (
      <HorizontalOutput
        height={outputHeight}
        width={outputWidth}
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

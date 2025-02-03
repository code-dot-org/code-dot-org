import React from 'react';
import {useResizable} from 'react-resizable-layout';

import ResizeBar from '../codebridge/components/ResizerBar';
import {InfoPanel} from '../codebridge/InfoPanel';
import Workspace from '../codebridge/Workspace';
import Output from '../codebridge/Workspace/Output';

import moduleStyles from './horizontal-layout.module.scss';

const HorizontalLayout: React.FunctionComponent = () => {
  const {position: infoPanelWidth, separatorProps: infoPanelSeparatorProps} =
    useResizable({
      axis: 'x',
      initial: 400,
      min: 0,
    });
  const {position: outputHeight, separatorProps: outputSeparatorProps} =
    useResizable({
      axis: 'y',
      initial: 300,
      min: 100,
      reverse: true,
    });

  return (
    <div className={moduleStyles.layoutContainer}>
      <InfoPanel style={{width: infoPanelWidth}} />
      <ResizeBar isVertical={true} {...infoPanelSeparatorProps} />
      <div className={moduleStyles.workspaceAndOutput}>
        <Workspace />
        <ResizeBar isVertical={false} {...outputSeparatorProps} />
        <Output style={{height: outputHeight}} />
      </div>
    </div>
  );
};

export default HorizontalLayout;

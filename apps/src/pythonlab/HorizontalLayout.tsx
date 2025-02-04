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
      {/* <div className={moduleStyles.infoPanel} style={{width: infoPanelWidth}}>
        Info Panel
      </div> */}
      <ResizeBar isVertical={true} {...infoPanelSeparatorProps} />
      <div className={moduleStyles.workspaceAndOutput}>
        {/* <div className={moduleStyles.workspace}>Workspace</div> */}
        <Workspace className={moduleStyles.workspace} />
        <ResizeBar isVertical={false} {...outputSeparatorProps} />
        {/* <div className={moduleStyles.output} style={{height: outputHeight}}>
          Output
        </div> */}
        <Output
          className={moduleStyles.output}
          style={{height: outputHeight}}
        />
      </div>
    </div>
  );
};

export default HorizontalLayout;

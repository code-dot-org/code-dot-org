import {InfoPanel} from '@codebridge/InfoPanel';
import Workspace from '@codebridge/Workspace';
import Output from '@codebridge/Workspace/Output';
import React, {useEffect} from 'react';
import {useResizable} from 'react-resizable-layout';

import ResizeBar from '@cdo/apps/codebridge/components/ResizeBar';

import moduleStyles from './layout.module.scss';

const HorizontalLayout: React.FunctionComponent = () => {
  const layoutContainerRef = React.useRef<HTMLDivElement>(null);
  const workspaceAndOutputContainerRef = React.useRef<HTMLDivElement>(null);
  const {
    position: infoPanelWidth,
    separatorProps: infoPanelSeparatorProps,
    isDragging: infoPanelDragging,
  } = useResizable({
    axis: 'x',
    initial: 300,
    min: 100,
    containerRef: layoutContainerRef,
  });
  const [rightPanelWidth, setRightPanelWidth] = React.useState<
    number | undefined
  >(undefined);
  const [workspaceHeight, setWorkspaceHeight] = React.useState<
    number | undefined
  >(undefined);
  const {
    position: outputHeight,
    separatorProps: outputSeparatorProps,
    isDragging: outputDragging,
  } = useResizable({
    axis: 'y',
    initial: 300,
    min: 100,
    reverse: true,
    containerRef: workspaceAndOutputContainerRef,
  });

  useEffect(() => {
    setRightPanelWidth(Math.max(window.innerWidth - infoPanelWidth - 13, 400));
  }, [infoPanelWidth]);

  useEffect(() => {
    setWorkspaceHeight(
      Math.max(window.innerHeight - outputHeight - 13 - 80, 200)
    );
  }, [outputHeight]);

  return (
    <div className={moduleStyles.layoutContainer} ref={layoutContainerRef}>
      <InfoPanel style={{width: infoPanelWidth}} />
      <ResizeBar
        isVertical={true}
        {...infoPanelSeparatorProps}
        isDragging={infoPanelDragging}
      />
      <div
        className={moduleStyles.flexColumn}
        ref={workspaceAndOutputContainerRef}
        style={{width: rightPanelWidth}}
      >
        <div style={{height: workspaceHeight}}>
          <Workspace className={moduleStyles.flexGrow} />
        </div>
        <ResizeBar
          isVertical={false}
          {...outputSeparatorProps}
          isDragging={outputDragging}
        />
        <Output className={moduleStyles.flexShrink0} height={outputHeight} />
      </div>
    </div>
  );
};

export default HorizontalLayout;

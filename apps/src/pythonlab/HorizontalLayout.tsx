import React, {useEffect} from 'react';
import {useResizable} from 'react-resizable-layout';

import ResizeBar from '../codebridge/components/ResizerBar';
import {InfoPanel} from '../codebridge/InfoPanel';
import Workspace from '../codebridge/Workspace';
import Output from '../codebridge/Workspace/Output';

import moduleStyles from './horizontal-layout.module.scss';

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
    min: 0,
    containerRef: layoutContainerRef,
  });
  const [rightPanelWidth, setRightPanelWidth] = React.useState<
    number | undefined
  >(undefined);
  const {
    position: outputHeight,
    separatorProps: outputSeparatorProps,
    isDragging: outputDragging,
  } = useResizable({
    axis: 'y',
    initial: 300,
    min: 0,
    reverse: true,
    containerRef: workspaceAndOutputContainerRef,
  });

  useEffect(() => {
    setRightPanelWidth(Math.max(window.innerWidth - infoPanelWidth - 20, 400));
  }, [infoPanelWidth]);

  return (
    <div className={moduleStyles.layoutContainer} ref={layoutContainerRef}>
      <InfoPanel style={{width: infoPanelWidth}} />
      <ResizeBar
        isVertical={true}
        {...infoPanelSeparatorProps}
        isDragging={infoPanelDragging}
      />
      <div
        className={moduleStyles.workspaceAndOutput}
        ref={workspaceAndOutputContainerRef}
        style={{width: rightPanelWidth}}
      >
        <Workspace className={moduleStyles.workspace} />
        <ResizeBar
          isVertical={false}
          {...outputSeparatorProps}
          isDragging={outputDragging}
        />
        <Output className={moduleStyles.output} height={outputHeight} />
      </div>
    </div>
  );
};

export default HorizontalLayout;

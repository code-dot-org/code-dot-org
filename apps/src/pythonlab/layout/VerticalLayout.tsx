import ResizeBar from '@codebridge/components/ResizerBar';
import {InfoPanel} from '@codebridge/InfoPanel';
import Workspace from '@codebridge/Workspace';
import Output from '@codebridge/Workspace/Output';
import React, {useEffect} from 'react';
import {useResizable} from 'react-resizable-layout';

import moduleStyles from './horizontal-layout.module.scss';

const VerticalLayout: React.FunctionComponent = () => {
  const layoutContainerRef = React.useRef<HTMLDivElement>(null);
  const outputContainerRef = React.useRef<HTMLDivElement>(null);
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
  const [editorWidth, setEditorWidth] = React.useState<number | undefined>(
    undefined
  );
  const {
    position: outputWidth,
    separatorProps: outputSeparatorProps,
    isDragging: outputDragging,
  } = useResizable({
    axis: 'x',
    initial: 400,
    min: 0,
    reverse: true,
    containerRef: outputContainerRef,
  });

  useEffect(() => {
    setEditorWidth(
      Math.max(window.innerWidth - infoPanelWidth - outputWidth - 30, 400)
    );
  }, [infoPanelWidth, outputWidth]);

  return (
    <div className={moduleStyles.layoutContainer} ref={layoutContainerRef}>
      <InfoPanel style={{width: infoPanelWidth}} />
      <ResizeBar
        isVertical={true}
        {...infoPanelSeparatorProps}
        isDragging={infoPanelDragging}
      />
      <div style={{width: editorWidth}}>
        <Workspace className={moduleStyles.workspace} />
      </div>
      <ResizeBar
        isVertical={true}
        {...outputSeparatorProps}
        isDragging={outputDragging}
      />
      <div ref={outputContainerRef}>
        <Output className={moduleStyles.output} width={outputWidth} />
      </div>
    </div>
  );
};

export default VerticalLayout;

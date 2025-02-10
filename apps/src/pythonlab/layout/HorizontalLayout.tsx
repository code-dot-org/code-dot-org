import {InfoPanel} from '@codebridge/InfoPanel';
import Workspace from '@codebridge/Workspace';
import Output from '@codebridge/Workspace/Output';
import classNames from 'classnames';
import React, {useEffect} from 'react';
import {useResizable} from 'react-resizable-layout';

import ResizeBar, {
  RESIZE_BAR_SIZE_PX,
} from '@cdo/apps/codebridge/components/ResizeBar';

import moduleStyles from './layout.module.scss';

const MIN_RIGHT_PANEL_WIDTH = 500;
const MIN_LEFT_PANEL_WIDTH = 200;
const MIN_OUTPUT_HEIGHT = 120;
const MIN_EDITOR_HEIGHT = 200;
const INITIAL_INFO_PANEL_WIDTH = 300;
const INITIAL_OUTPUT_HEIGHT = 300;
// The top Y coordinate of the panel. This is the height of the main page header.
const PANEL_TOP_COORDINATE = 50;

const HorizontalLayout: React.FunctionComponent = () => {
  const [rightPanelWidth, setRightPanelWidth] = React.useState<
    number | undefined
  >(undefined);
  const [workspaceHeight, setWorkspaceHeight] = React.useState<
    number | undefined
  >(undefined);
  const {
    position: infoPanelWidth,
    separatorProps: infoPanelSeparatorProps,
    isDragging: infoPanelDragging,
  } = useResizable({
    axis: 'x',
    initial: INITIAL_INFO_PANEL_WIDTH,
    min: MIN_LEFT_PANEL_WIDTH,
  });
  const {
    position: outputHeight,
    separatorProps: outputSeparatorProps,
    isDragging: outputDragging,
  } = useResizable({
    axis: 'y',
    initial: INITIAL_OUTPUT_HEIGHT,
    min: MIN_OUTPUT_HEIGHT,
    reverse: true,
  });

  useEffect(() => {
    setRightPanelWidth(
      Math.max(
        window.innerWidth - infoPanelWidth - RESIZE_BAR_SIZE_PX,
        MIN_RIGHT_PANEL_WIDTH
      )
    );
  }, [infoPanelWidth]);

  useEffect(() => {
    setWorkspaceHeight(
      Math.max(
        window.innerHeight -
          outputHeight -
          RESIZE_BAR_SIZE_PX -
          PANEL_TOP_COORDINATE,
        MIN_EDITOR_HEIGHT
      )
    );
  }, [outputHeight]);

  return (
    <div className={moduleStyles.layoutContainer}>
      <InfoPanel style={{width: infoPanelWidth}} />
      <ResizeBar
        isVertical={true}
        separatorProps={infoPanelSeparatorProps}
        isDragging={infoPanelDragging}
      />
      <div className={moduleStyles.flexColumn} style={{width: rightPanelWidth}}>
        <Workspace
          style={{height: workspaceHeight}}
          className={moduleStyles.flexGrow}
        />
        <ResizeBar
          isVertical={false}
          separatorProps={outputSeparatorProps}
          isDragging={outputDragging}
        />
        <Output
          className={classNames(
            moduleStyles.flexShrink0,
            moduleStyles.flexGrow
          )}
          height={outputHeight}
        />
      </div>
    </div>
  );
};

export default HorizontalLayout;

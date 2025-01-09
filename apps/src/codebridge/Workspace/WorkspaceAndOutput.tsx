import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import Workspace from '@codebridge/Workspace';
import {debounce} from 'lodash';
import React, {useEffect, useMemo} from 'react';

import globalStyleConstants from '@cdo/apps/styleConstants';
import HeightResizer from '@cdo/apps/templates/instructions/HeightResizer';
import color from '@cdo/apps/util/color';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import Output from './Output';

import moduleStyles from './workspace.module.scss';

// The top Y coordinate of the panel. This includes the top header and the header
// of the workspace, which is absolutely positioned.
const PANEL_TOP_COORDINATE = 80;
const MINIMUM_EDITOR_HEIGHT = 200;
// 120px fits 4 lines of text.
const MINIMUM_OUTPUT_HEIGHT = 120;

// A component that combines the Workspace and Console component into a single component,
// with a horizontal resizer between them.
// This component is intended to get us through the Python Lab pilot, where we just need a resizable
// console. We will likely want a different pattern long-term, as we will want other components to
// be resizable, and don't want to have to make a bunch of different combination components to achieve that.
// We may want to investigate more general solution for this, such as a panel manager component.
// We also will want resizing to be accessible, and the HeightResizer component only works with mouse and touch
// events.
const WorkspaceAndOutput: React.FunctionComponent = () => {
  // Default console height is 400px.
  const [outputHeight, setOutputHeight] = React.useState(400);
  const [columnHeight, setColumnHeight] = React.useState(800);
  const miniApp = useAppSelector(state => state.lab.levelProperties?.miniApp);

  useEffect(() => {
    const handleColumnResize = () => {
      setColumnHeight(window.innerHeight - PANEL_TOP_COORDINATE);
    };
    handleColumnResize();

    window.addEventListener('resize', debounce(handleColumnResize, 10));
  }, []);

  useEffect(() => {
    normalizeOutputHeight(outputHeight, miniApp);
  }, [outputHeight, columnHeight, miniApp]);

  const handleResize = (desiredHeight: number) => {
    // While the horizontal resizer thinks it's resizing the content above it, which
    // is the editor panel, we are actually storing the size of the output below it.
    // That way, if the window resizes, the output stays the same height while the editor
    // changes in height.
    const desiredOutputHeight = columnHeight - desiredHeight;
    normalizeOutputHeight(desiredOutputHeight, miniApp);
  };

  // Given a desired output height, ensure it is between the minimum and maximum
  // output height.
  const normalizeOutputHeight = (
    desiredOutputHeight: number,
    miniAppName: string | undefined
  ) => {
    const outputHeightMin = MINIMUM_OUTPUT_HEIGHT;
    const outputHeightMax = window.innerHeight - MINIMUM_EDITOR_HEIGHT;
    const newOutputHeight = Math.max(
      outputHeightMin,
      Math.min(desiredOutputHeight, outputHeightMax)
    );

    setOutputHeight(newOutputHeight);

    CodebridgeRegistry.getInstance()
      .getConsoleManager()
      ?.getTerminalFitAddon()
      ?.fit();

    // If this is a neighborhood level, also resize the visualization.
    if (miniAppName === 'neighborhood') {
      const sliderHeight = 60;
      // The original visualization is rendered at 800x800.
      const originalVisualizationWidth = 800;
      const headerSize = 40;
      const availableHeight = newOutputHeight - headerSize - sliderHeight;
      // For now the width is always 400px.
      const availableWidth = 400;
      const newVisualizationWidth = Math.min(availableHeight, availableWidth);
      // Scale the visualization.
      let scale = newVisualizationWidth / originalVisualizationWidth;
      if (scale < 0) {
        // Avoid inverting.
        scale = 0;
      }
      const scaleCss = `scale(${scale})`;
      $('#svgMaze').css({
        transform: scaleCss,
        'transform-origin': '0 0',
        position: 'absolute',
      });

      // Scale the visualization div
      $('#visualization').css({
        height: newVisualizationWidth,
        'margin-left': (availableWidth - newVisualizationWidth) / 2,
      });
    }
  };

  // The editor height is computed based on the column height, output height,
  // and the height of the resize bar. The resize bar gets positioned at the bottom
  // of the editor, and seemingly expects to be included in the height of the editor.
  const editorHeight = useMemo(
    () =>
      columnHeight - outputHeight + globalStyleConstants['resize-bar-width'],
    [columnHeight, outputHeight]
  );

  return (
    <div className={moduleStyles.workspaceAndOutput}>
      <div style={{height: editorHeight}}>
        <Workspace />
      </div>
      <HeightResizer
        resizeItemTop={() => PANEL_TOP_COORDINATE}
        position={editorHeight}
        onResize={handleResize}
        style={{position: 'static', backgroundColor: color.light_gray_950}}
      />
      <div style={{height: outputHeight}}>
        <Output />
      </div>
    </div>
  );
};

export default WorkspaceAndOutput;

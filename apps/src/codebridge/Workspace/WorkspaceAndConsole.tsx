import Console from '@codebridge/Console';
import Workspace from '@codebridge/Workspace';
import {debounce} from 'lodash';
import React, {useEffect, useMemo} from 'react';

import globalStyleConstants from '@cdo/apps/styleConstants';
import HeightResizer from '@cdo/apps/templates/instructions/HeightResizer';

import moduleStyles from './workspace.module.scss';

// The top Y coordinate of the panel. This includes the top header and the header
// of the workspace, which is absolutely positioned.
const PANEL_TOP_COORDINATE = 80;

// A component that combines the Workspace and Console component into a single component,
// with a horizontal resizer between them.
// This component is intended to get us through the Python Lab pilot, where we just need a resizable
// console. We will likely want a different pattern long-term, as we will want other components to
// be resizable, and don't want to have to make a bunch of different combination components to achieve that.
// We may want to investigate more general solution for this, such as a panel manager component.
// We also will want resizing to be accessible, and the HeightResizer component only works with mouse and touch
// events.
const WorkspaceAndConsole: React.FunctionComponent = () => {
  const [consoleHeight, setConsoleHeight] = React.useState(350);
  const [columnHeight, setColumnHeight] = React.useState(800);

  useEffect(() => {
    const handleColumnResize = () => {
      setColumnHeight(window.innerHeight - PANEL_TOP_COORDINATE);
    };
    handleColumnResize();

    window.addEventListener('resize', debounce(handleColumnResize, 10));
  }, []);

  useEffect(() => {
    normalizeConsoleHeight(consoleHeight);
  }, [consoleHeight, columnHeight]);

  const handleResize = (desiredHeight: number) => {
    // While the horizontal resizer thinks it's resizing the content above it, which
    // is the editor panel, we are actually storing the size of the console below it.
    // That way, if the window resizes, the console stays the same height while the editor
    // changes in height.
    const consoleDesiredHeight = columnHeight - desiredHeight;
    normalizeConsoleHeight(consoleDesiredHeight);
  };

  // Given a desired console height, ensure it is between the minimum and maximum
  // console height.
  const normalizeConsoleHeight = (desiredConsoleHeight: number) => {
    // Minimum height fits 4 lines of text.
    const consoleHeightMin = 120;
    const consoleHeightMax = window.innerHeight - 200;

    setConsoleHeight(
      Math.max(
        consoleHeightMin,
        Math.min(desiredConsoleHeight, consoleHeightMax)
      )
    );
  };

  // The editor height is computed based on the column height, console height,
  // and the height of the resize bar. The resize bar gets positioned at the bottom
  // of the editor, and seemingly expects to be included in the height of the editor.
  const editorHeight = useMemo(
    () =>
      columnHeight - consoleHeight + globalStyleConstants['resize-bar-width'],
    [columnHeight, consoleHeight]
  );

  return (
    <div className={moduleStyles.workspaceAndConsole}>
      <div style={{height: editorHeight}}>
        <Workspace />
      </div>
      <HeightResizer
        resizeItemTop={() => PANEL_TOP_COORDINATE}
        position={editorHeight}
        onResize={handleResize}
        style={{position: 'static'}}
      />
      <div style={{height: consoleHeight}}>
        <Console />
      </div>
    </div>
  );
};

export default WorkspaceAndConsole;

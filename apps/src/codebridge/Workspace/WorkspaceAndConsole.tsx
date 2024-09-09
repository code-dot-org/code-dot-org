import Console from '@codebridge/Console';
import Workspace from '@codebridge/Workspace';
import {debounce} from 'lodash';
import React, {useEffect, useMemo} from 'react';

import HeightResizer from '@cdo/apps/templates/instructions/HeightResizer';

import moduleStyles from './workspace.module.scss';

// The top Y coordinate of the panel.  Above them is just the common site
// header and then a bit of empty space.
const PANEL_TOP_COORDINATE = 60;

// A component that combines the Workspace and Console component into a single component,
// with a horizontal resizer between them.
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

  const editorHeight = useMemo(
    () => columnHeight - consoleHeight,
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

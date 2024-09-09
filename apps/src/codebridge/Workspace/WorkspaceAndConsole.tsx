import Console from '@codebridge/Console';
import Workspace from '@codebridge/Workspace';
import {debounce} from 'lodash';
import React, {useEffect, useMemo} from 'react';

import HeightResizer from '@cdo/apps/templates/instructions/HeightResizer';

import moduleStyles from './workspace.module.scss';

// The top Y coordinate of the panel.  Above them is just the common site
// header and then a bit of empty space.
const PANEL_TOP_COORDINATE = 60;

const WorkspaceAndConsole: React.FunctionComponent = () => {
  const [consoleHeight, setConsoleHeight] = React.useState(200);
  const [columnHeight, setColumnHeight] = React.useState(600);

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

  const normalizeConsoleHeight = (desiredConsoleHeight: number) => {
    // Minimum height fits 3 lines of text
    const consoleHeightMin = 140;
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
      />
      <div style={{height: consoleHeight}}>
        <Console />
      </div>
    </div>
  );
};

export default WorkspaceAndConsole;

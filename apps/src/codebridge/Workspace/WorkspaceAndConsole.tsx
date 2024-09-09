import Console from '@codebridge/Console';
import Workspace from '@codebridge/Workspace';
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
    setColumnHeight(window.innerHeight - PANEL_TOP_COORDINATE);
  }, []);

  const handleResize = (desiredHeight: number) => {
    setConsoleHeight(columnHeight - desiredHeight);
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

import {useState} from 'react';

import {
  CodeEditor,
  Console,
  FileBrowser,
  FileTabs,
} from '@code-dot-org/codebridge';
import {PanelContainer, WorkspaceHeader} from '@code-dot-org/lab';

import InstructionsPanel from './InstructionsPanel';
import styles from './pythonLayout.module.css';
import ResizeHandle from './ResizeHandle';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const SIDEBAR = {initial: 220, min: 160, max: 420};
const CONSOLE = {initial: 260, min: 100, max: 620};

/**
 * The Python Lab workspace. Mirrors the legacy pythonlab HorizontalLayout: the
 * instructions / resource panel on the far left (it self-sizes and has its own
 * collapse rail, like music lab), then a right column with the workspace on top
 * (file browser + editor with tabs) and the console spanning the full width
 * below. The file-browser and console dividers are drag-to-resize. The mini-app
 * preview is still deferred.
 */
const PythonLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR.initial);
  const [consoleHeight, setConsoleHeight] = useState(CONSOLE.initial);

  return (
    <div className={styles.layout}>
      <InstructionsPanel />

      <div className={styles.rightColumn}>
        <div className={styles.workspaceSection}>
          <PanelContainer
            id="python-workspace"
            headerContent={<WorkspaceHeader />}
          >
            <div className={styles.topArea}>
              <aside className={styles.sidebar} style={{width: sidebarWidth}}>
                <FileBrowser />
              </aside>
              <ResizeHandle
                axis="x"
                ariaLabel="Resize file browser"
                value={sidebarWidth}
                min={SIDEBAR.min}
                max={SIDEBAR.max}
                onDelta={dx =>
                  setSidebarWidth(w => clamp(w + dx, SIDEBAR.min, SIDEBAR.max))
                }
              />
              <div className={styles.editorPane}>
                <FileTabs />
                <div className={styles.editor}>
                  <CodeEditor />
                </div>
              </div>
            </div>
          </PanelContainer>
        </div>
        <ResizeHandle
          axis="y"
          ariaLabel="Resize console"
          value={consoleHeight}
          min={CONSOLE.min}
          max={CONSOLE.max}
          onDelta={dy =>
            setConsoleHeight(h => clamp(h - dy, CONSOLE.min, CONSOLE.max))
          }
        />
        <div className={styles.consolePane} style={{height: consoleHeight}}>
          <Console />
        </div>
      </div>
    </div>
  );
};

export default PythonLayout;

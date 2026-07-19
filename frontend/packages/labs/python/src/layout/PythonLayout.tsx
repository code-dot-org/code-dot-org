import {useState} from 'react';

import {
  CodeEditor,
  Console,
  FileBrowser,
  FileTabs,
} from '@code-dot-org/codebridge';

import styles from './pythonLayout.module.css';
import ResizeHandle from './ResizeHandle';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const SIDEBAR = {initial: 240, min: 160, max: 480};
const CONSOLE = {initial: 260, min: 100, max: 620};

/**
 * The Python Lab workspace: a file-browser sidebar and the editor (tabs +
 * CodeMirror) on top, with the console spanning the full width below. The two
 * dividers are drag-to-resize. A simplified stand-in for the legacy
 * apps/src/pythonlab HorizontalLayout — the instructions/info panel and the
 * mini-app preview are still deferred.
 */
const PythonLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR.initial);
  const [consoleHeight, setConsoleHeight] = useState(CONSOLE.initial);

  return (
    <div className={styles.layout}>
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
  );
};

export default PythonLayout;

import {useState, type CSSProperties} from 'react';

import {
  CodeEditor,
  Console,
  FileBrowser,
  FileBrowserToggleButton,
  FileTabs,
} from '@code-dot-org/codebridge';
import {PanelContainer, WorkspaceHeader} from '@code-dot-org/lab';

import InstructionsPanel from './InstructionsPanel';
import styles from './pythonLayout.module.css';
import ResizeHandle from './ResizeHandle';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

// Legacy's INITIAL_INFO_PANEL_WIDTH / MIN_LEFT_PANEL_WIDTH equivalents.
const INSTRUCTIONS = {initial: 320, min: 200, max: 640};
const SIDEBAR = {initial: 220, min: 160, max: 420};
const CONSOLE = {initial: 260, min: 100, max: 620};

/**
 * The Python Lab workspace. Mirrors the legacy pythonlab HorizontalLayout: the
 * instructions / resource panel on the far left, then a right column with the
 * workspace on top (file browser + editor with tabs) and the console spanning
 * the full width below. Every divider is drag-to-resize, and double-clicking one
 * restores its default size (as legacy's react-resizable-layout separators do).
 * The mini-app preview is still deferred.
 */
const PythonLayout = () => {
  const [instructionsWidth, setInstructionsWidth] = useState(
    INSTRUCTIONS.initial,
  );
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR.initial);
  const [consoleHeight, setConsoleHeight] = useState(CONSOLE.initial);
  // Legacy has no draggable file-browser divider, only a collapse toggle; we
  // keep both — resize when open, collapse to a thin rail via the button.
  const [fileBrowserCollapsed, setFileBrowserCollapsed] = useState(false);

  return (
    // The instructions width rides on a custom property so it can land on the
    // ResourcePanel itself (which takes a className but no style prop).
    <div
      className={styles.layout}
      style={
        {'--instructions-width': `${instructionsWidth}px`} as CSSProperties
      }
    >
      <InstructionsPanel className={styles.instructions} />
      <ResizeHandle
        axis="x"
        ariaLabel="Resize instructions"
        value={instructionsWidth}
        min={INSTRUCTIONS.min}
        max={INSTRUCTIONS.max}
        onDelta={dx =>
          setInstructionsWidth(w =>
            clamp(w + dx, INSTRUCTIONS.min, INSTRUCTIONS.max),
          )
        }
        onReset={() => setInstructionsWidth(INSTRUCTIONS.initial)}
      />

      <div className={styles.rightColumn}>
        <div className={styles.workspaceSection}>
          <PanelContainer
            id="python-workspace"
            headerContent={<WorkspaceHeader />}
          >
            <div className={styles.topArea}>
              {/* Collapsed: the file browser is fully hidden so the editor spans
                  the whole width; the re-open toggle sits in the tab strip. */}
              {!fileBrowserCollapsed && (
                <>
                  <aside
                    className={styles.sidebar}
                    style={{width: sidebarWidth}}
                  >
                    <FileBrowser
                      onToggleCollapse={() => setFileBrowserCollapsed(true)}
                    />
                  </aside>
                  <ResizeHandle
                    axis="x"
                    ariaLabel="Resize file browser"
                    value={sidebarWidth}
                    min={SIDEBAR.min}
                    max={SIDEBAR.max}
                    onDelta={dx =>
                      setSidebarWidth(w =>
                        clamp(w + dx, SIDEBAR.min, SIDEBAR.max),
                      )
                    }
                    onReset={() => setSidebarWidth(SIDEBAR.initial)}
                  />
                </>
              )}
              <div className={styles.editorPane}>
                <div className={styles.tabBar}>
                  {fileBrowserCollapsed && (
                    <span className={styles.reopen}>
                      <FileBrowserToggleButton
                        collapsed
                        onClick={() => setFileBrowserCollapsed(false)}
                      />
                    </span>
                  )}
                  <div className={styles.tabsFill}>
                    <FileTabs />
                  </div>
                </div>
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
          onReset={() => setConsoleHeight(CONSOLE.initial)}
        />
        <div className={styles.consolePane} style={{height: consoleHeight}}>
          <Console />
        </div>
      </div>
    </div>
  );
};

export default PythonLayout;

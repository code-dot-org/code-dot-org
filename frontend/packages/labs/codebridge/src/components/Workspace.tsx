import {useState} from 'react';

import {ResizeHandle} from '@code-dot-org/lab/components';

import CodeEditor from '../editor/CodeEditor';

import FileBrowser from './FileBrowser';
import {FileBrowserToggleButton} from './FileBrowserToggleButton';
import FileTabs from './FileTabs';
import styles from './workspace.module.css';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const SIDEBAR = {initial: 220, min: 160, max: 420};

export interface WorkspaceProps {
  /**
   * Rendered between the tab strip and the editor — e.g. a lab's own toolbar.
   * Most labs pass nothing.
   */
  children?: React.ReactNode;
}

/**
 * The Codebridge workspace: the file browser beside the tab strip and editor,
 * with a drag-to-resize divider between them and a collapse toggle that hides
 * the browser entirely so the editor spans the full width (the re-open button
 * then sits in the tab strip). Shared by every Codebridge lab — legacy
 * `@codebridge/Workspace/Workspace`.
 *
 * The host supplies the surrounding chrome (a PanelContainer, the console or
 * preview beneath it, and so on); this owns only the browser/editor split.
 */
export const Workspace = ({children}: WorkspaceProps) => {
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR.initial);
  // Legacy has no draggable file-browser divider, only a collapse toggle; we
  // keep both — resize when open, collapse to zero width via the button.
  const [fileBrowserCollapsed, setFileBrowserCollapsed] = useState(false);

  return (
    <div className={styles.topArea}>
      {/* Collapsed: the file browser is fully hidden so the editor spans the
          whole width; the re-open toggle sits in the tab strip. */}
      {!fileBrowserCollapsed && (
        <>
          <aside className={styles.sidebar} style={{width: sidebarWidth}}>
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
              setSidebarWidth(w => clamp(w + dx, SIDEBAR.min, SIDEBAR.max))
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
        {children}
        <div className={styles.editor}>
          <CodeEditor />
        </div>
      </div>
    </div>
  );
};

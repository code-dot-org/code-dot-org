import {
  CodeEditor,
  Console,
  FileBrowser,
  FileTabs,
} from '@code-dot-org/codebridge';

import styles from './pythonLayout.module.css';

/**
 * The Python Lab workspace: file browser, then the editor (tabs + CodeMirror),
 * then the console, side by side. A simplified stand-in for the legacy
 * apps/src/pythonlab HorizontalLayout — resizable panels, the info/instructions
 * panel, and the mini-app preview are deferred.
 */
const PythonLayout = () => (
  <div className={styles.layout}>
    <aside className={styles.sidebar}>
      <FileBrowser />
    </aside>
    <div className={styles.editorPane}>
      <FileTabs />
      <div className={styles.editor}>
        <CodeEditor />
      </div>
    </div>
    <div className={styles.consolePane}>
      <Console />
    </div>
  </div>
);

export default PythonLayout;

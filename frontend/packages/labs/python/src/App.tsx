import {useMemo} from 'react';

import {
  CodebridgeLab,
  CodebridgeRegistry,
  CodebridgeRuntimeProvider,
} from '@code-dot-org/codebridge';
import type {CodebridgeRuntime} from '@code-dot-org/codebridge';
import type {LevelPropertiesMap} from '@code-dot-org/core/api';

import styles from './app.module.css';
import {pythonConfig} from './config';
import {DEFAULT_PROJECT} from './constants';
import PythonLayout from './layout/PythonLayout';

/**
 * Host-supplied props for the Python Lab entrypoint — the standard
 * `LabEntrypointProps` loading contract the studio host drives. Forwarded to
 * {@link CodebridgeLab}, which owns sources, theming, and the level-properties
 * context.
 */
export interface PythonLabProps {
  isLoading: boolean;
  levelId?: string;
  standaloneProjectType?: string;
  levelPropertiesMap?: LevelPropertiesMap;
}

/**
 * The runtime callbacks Codebridge invokes (Run/Stop, console input). This is a
 * STUB until the pyodide runtime is ported: `onRun` just notes that execution
 * isn't wired yet. It proves the console + registry seam end to end.
 */
const useStubPythonRuntime = (): CodebridgeRuntime =>
  useMemo(
    () => ({
      onRun: () => {
        CodebridgeRegistry.getConsoleManager()?.writeConsoleMessage(
          'Python execution is not wired up yet (pyodide pending).',
        );
      },
      onStop: () => {},
      sendConsoleInput: () => {},
    }),
    [],
  );

/**
 * The Python Lab entrypoint. Composes the Codebridge shell: `CodebridgeLab`
 * provides the multi-file sources, config, and lab context; the runtime provider
 * supplies Run/Stop/console callbacks; {@link PythonLayout} lays out the file
 * browser, editor, and console.
 */
const PythonLab = (props: PythonLabProps) => {
  const runtime = useStubPythonRuntime();

  return (
    <div className={styles.app}>
      <CodebridgeLab
        {...props}
        config={pythonConfig}
        defaultSources={DEFAULT_PROJECT}
      >
        <CodebridgeRuntimeProvider runtime={runtime}>
          <PythonLayout />
        </CodebridgeRuntimeProvider>
      </CodebridgeLab>
    </div>
  );
};

export default PythonLab;

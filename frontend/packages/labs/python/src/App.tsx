import {useEffect, useMemo, useRef} from 'react';
import type {PropsWithChildren} from 'react';

import {
  CodebridgeLab,
  CodebridgeRuntimeProvider,
} from '@code-dot-org/codebridge';
import type {CodebridgeRuntime} from '@code-dot-org/codebridge';
import type {LevelPropertiesMap, MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import styles from './app.module.css';
import {pythonConfig} from './config';
import {DEFAULT_PROJECT} from './constants';
import PythonLayout from './layout/PythonLayout';
import {
  preloadPython,
  runPython,
  sendPythonInput,
  stopPython,
} from './runtime/pythonRunner';

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
 * Provides the pyodide runtime callbacks to Codebridge. Reads the current
 * sources (so Run always uses the latest edits) through a ref, so the runtime
 * object stays stable. Mounted inside `CodebridgeLab`, whose `SourcesProvider`
 * backs `useSources`.
 */
const PythonRuntimeProvider = ({children}: PropsWithChildren) => {
  const {currentSources} = useSources<MultiFileSource>();
  const sourceRef = useRef(currentSources.source);
  sourceRef.current = currentSources.source;

  // Start loading pyodide as soon as the lab mounts so the first Run is fast.
  useEffect(() => {
    preloadPython();
  }, []);

  const runtime = useMemo<CodebridgeRuntime>(
    () => ({
      onRun: () => runPython(sourceRef.current),
      onStop: () => stopPython(),
      // Stdin for `input()`; only wired on the sandbox path (see pythonRunner).
      sendConsoleInput: (value: string) => sendPythonInput(value),
    }),
    [],
  );

  return (
    <CodebridgeRuntimeProvider runtime={runtime}>
      {children}
    </CodebridgeRuntimeProvider>
  );
};

/**
 * The Python Lab entrypoint. Composes the Codebridge shell: `CodebridgeLab`
 * provides the multi-file sources, config, and lab context; the runtime provider
 * supplies Run/Stop/console callbacks (pyodide); {@link PythonLayout} lays out the
 * instructions, file browser, editor, and console.
 */
const PythonLab = (props: PythonLabProps) => (
  <div className={styles.app}>
    <CodebridgeLab
      {...props}
      config={pythonConfig}
      defaultSources={DEFAULT_PROJECT}
    >
      <PythonRuntimeProvider>
        <PythonLayout />
      </PythonRuntimeProvider>
    </CodebridgeLab>
  </div>
);

export default PythonLab;

import {useEffect, useMemo, useRef} from 'react';
import type {PropsWithChildren} from 'react';

import {
  CodebridgeLab,
  CodebridgeRuntimeProvider,
  useAppSelector,
} from '@code-dot-org/codebridge';
import type {CodebridgeRuntime} from '@code-dot-org/codebridge';
import type {
  MultiFileSource,
  ProjectSources,
} from '@code-dot-org/core/api';
import {LabRegistry,useSources} from '@code-dot-org/lab/contexts';
import {labActions} from '@code-dot-org/lab/redux';

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
import {registerSourceWriter} from './runtime/sourceWriteBack';

/**
 * Provides the pyodide runtime callbacks to Codebridge. Reads the current
 * sources (so Run always uses the latest edits) through a ref, so the runtime
 * object stays stable. Mounted inside `CodebridgeLab`, whose `SourcesProvider`
 * backs `useSources`.
 */
const PythonRuntimeProvider = ({children}: PropsWithChildren) => {
  const {currentSources, previewSources} = useSources<MultiFileSource>();
  const sourceRef = useRef(currentSources.source);
  sourceRef.current = currentSources.source;

  // Start loading pyodide as soon as the lab mounts so the first Run is fast.
  useEffect(() => {
    preloadPython();
  }, []);

  // Let the runtime (which lives outside the React tree) fold a run's updated
  // project back in: files the program created or changed.
  //
  // This cannot go through `updateSources`: Python Lab marks the workspace
  // read-only *while a program runs* (to stop the user editing mid-run), and the
  // write-back arrives during exactly that window, so `updateSources` would skip
  // the save and the new files would never persist. Legacy has the same rule and
  // sidesteps it by having `setAndSaveSource` call the project manager directly.
  // We do the same: show the sources without saving, then save explicitly —
  // skipping only when the workspace is *permanently* read-only (not the owner,
  // frozen, viewing an old version), where no save should ever happen.
  const currentSourcesRef = useRef(currentSources);
  currentSourcesRef.current = currentSources;
  const permanentlyReadOnly = useAppSelector(
    labActions.isPermanentlyReadOnlyWorkspace,
  );
  const permanentlyReadOnlyRef = useRef(permanentlyReadOnly);
  permanentlyReadOnlyRef.current = permanentlyReadOnly;
  useEffect(() => {
    registerSourceWriter(source => {
      const next = {...currentSourcesRef.current, source};
      previewSources(next);
      if (!permanentlyReadOnlyRef.current) {
        void LabRegistry.projectManager?.save(next as ProjectSources);
      }
    });
    return () => registerSourceWriter(null);
  }, [previewSources]);

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
// Self-contained: the studio host renders the single `<Lab>` (see LabHost) and
// publishes level data to context, so the entrypoint takes no props.
const PythonLab = () => (
  <div className={styles.app}>
    <CodebridgeLab config={pythonConfig} defaultSources={DEFAULT_PROJECT}>
      <PythonRuntimeProvider>
        <PythonLayout />
      </PythonRuntimeProvider>
    </CodebridgeLab>
  </div>
);

export default PythonLab;

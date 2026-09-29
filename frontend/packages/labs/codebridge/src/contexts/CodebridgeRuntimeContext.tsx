import {createContext, useContext} from 'react';
import type {PropsWithChildren} from 'react';

/**
 * Runtime callbacks supplied by the consuming lab (Python Lab, later Web Lab 2).
 * The generic shell has no runtime of its own: the Run/Stop buttons and the
 * console call these, and the lab wires them to its code runner. Ported from the
 * runtime slice of the legacy `codebridgeContext`.
 *
 * The runtime owns its own lifecycle — `onRun` should dispatch the base
 * `labSystem` run flags (`setIsRunning`, `setHasRun`, ...) so the Run/Stop button
 * reflects state.
 */
export interface CodebridgeRuntime {
  /** Run the current program. */
  onRun?: () => void;
  /** Stop a running program. */
  onStop?: () => void;
  /** Send a line of console input (stdin) to the running program. */
  sendConsoleInput?: (input: string) => void;
}

const CodebridgeRuntimeContext = createContext<CodebridgeRuntime>({});

/** The current runtime callbacks. Empty (no-op) with no provider. */
export const useCodebridgeRuntime = () => useContext(CodebridgeRuntimeContext);

export const CodebridgeRuntimeProvider = ({
  runtime,
  children,
}: PropsWithChildren<{runtime: CodebridgeRuntime}>) => (
  <CodebridgeRuntimeContext.Provider value={runtime}>
    {children}
  </CodebridgeRuntimeContext.Provider>
);

// The lab-side runtime: it wires the Codebridge project to the sandbox. On every
// edit it flattens the sources, compiles them (compile surface), and loads the
// result (preview surface); it collects the preview's relayed console so the
// Console/Debugger box can show it. Mirrors python-lab's PythonRuntimeProvider,
// but drives the two-surface compile→preview flow (PLAN §5).
//
// Recompile-and-reload is milestone 3's Level-0 hot reload; the Level-1 in-place
// property patch is milestone 4.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {setProjectAnimations} from '../blockly/animationOptions';
import {
  BlocklyGenerator,
  type BlocklyGeneratorHandle,
} from '../blockly/BlocklyGenerator';
import {projectAnimationIds} from '../blockly/projectAnimations';
import {ENTRY_FILE} from '../constants';

import type {ReloadReport} from './messages';
import {projectFiles} from './projectFiles';
import {WorldCompileManager} from './sandbox/worldCompileManager';
import {WorldPreviewManager} from './sandbox/worldPreviewManager';
import {getAssetBaseUrl, getSandboxUrl} from './worldConfig';

/** A `.rule` / `.actor` file needs Blockly → world-lab generation before compile. */
const isBlocklyPath = (path: string): boolean =>
  path.endsWith('.rule') || path.endsWith('.actor');

export interface ConsoleLine {
  level: string;
  text: string;
}

export type RuntimeStatus = 'idle' | 'compiling' | 'running' | 'error';

interface WorldRuntimeValue {
  /** Whether a sandbox origin is configured; false shows the "no sandbox" note. */
  isConfigured: boolean;
  /** The preview iframe to mount in the pane (null until created / if unconfigured). */
  previewIframe: HTMLIFrameElement | null;
  consoleLog: ConsoleLine[];
  clearConsole: () => void;
  status: RuntimeStatus;
}

const WorldRuntimeContext = createContext<WorldRuntimeValue | null>(null);

const DEBOUNCE_MS = 300;
const MAX_CONSOLE_LINES = 500;

export function WorldRuntimeProvider({children}: {children: ReactNode}) {
  const sandboxUrl = useMemo(() => getSandboxUrl(), []);
  const {currentSources} = useSources<MultiFileSource>();

  const [consoleLog, setConsoleLog] = useState<ConsoleLine[]>([]);
  const [status, setStatus] = useState<RuntimeStatus>('idle');
  const [previewIframe, setPreviewIframe] = useState<HTMLIFrameElement | null>(
    null,
  );

  const managers = useRef<{
    compile: WorldCompileManager;
    preview: WorldPreviewManager;
  } | null>(null);
  // Generation counter so a slow compile can't clobber a newer one.
  const generation = useRef(0);

  // The Blockly → world-lab generator (a hidden workspace); ready once injected.
  const blocklyGenerator = useRef<BlocklyGeneratorHandle>(null);
  const [generatorReady, setGeneratorReady] = useState(false);

  const pushConsole = (line: ConsoleLine) =>
    setConsoleLog(prev => [...prev, line].slice(-MAX_CONSOLE_LINES));

  /** Replace each Blockly file's JSON with its generated JavaScript. */
  const generateBlocklyFiles = (
    files: Record<string, string>,
  ): Record<string, string> => {
    const generator = blocklyGenerator.current;
    const out: Record<string, string> = {};
    for (const [path, contents] of Object.entries(files)) {
      out[path] =
        isBlocklyPath(path) && generator
          ? generator.generate(contents)
          : contents;
    }
    return out;
  };

  // Create the sandbox managers once, when configured.
  useEffect(() => {
    if (!sandboxUrl) {
      return;
    }
    const assetBase = getAssetBaseUrl();
    const compile = new WorldCompileManager({sandboxUrl, assetBase});
    const preview = new WorldPreviewManager({
      sandboxUrl,
      assetBase,
      onConsole: (level, args) =>
        pushConsole({level, text: args.map(String).join(' ')}),
      onEngineError: message => pushConsole({level: 'error', text: message}),
    });
    managers.current = {compile, preview};
    setPreviewIframe(preview.iframe);
    return () => {
      compile.destroy();
      preview.destroy();
      managers.current = null;
      setPreviewIframe(null);
    };
  }, [sandboxUrl]);

  // Recompile + reload whenever the sources change (debounced).
  useEffect(() => {
    if (!managers.current) {
      return;
    }
    const files = projectFiles(currentSources.source);
    // The project has not loaded yet (initial render / level still loading);
    // compiling an empty project would spuriously fail to find the entry.
    if (Object.keys(files).length === 0) {
      return;
    }
    // Refresh the `world_play_animation` dropdown from the project's animation
    // files, before the editor loads a block or the generator runs.
    setProjectAnimations(projectAnimationIds(files));
    // Wait for the Blockly generator before compiling a project that has any
    // Blockly-authored files; this effect re-runs when it becomes ready.
    if (Object.keys(files).some(isBlocklyPath) && !generatorReady) {
      return;
    }
    const handle = window.setTimeout(() => {
      void compileAndLoad(files);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
    // compileAndLoad closes over refs and stable state setters only.
  }, [currentSources, generatorReady]);

  async function compileAndLoad(files: Record<string, string>) {
    const pair = managers.current;
    if (!pair) {
      return;
    }
    // Generate JavaScript for any Blockly (.rule/.actor) files before compiling.
    let compileFiles: Record<string, string>;
    try {
      compileFiles = generateBlocklyFiles(files);
    } catch (error) {
      pushConsole({
        level: 'error',
        text: `Blockly generation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
      setStatus('error');
      return;
    }
    // A clearer message than the compiler's raw "no such project file" when the
    // project simply has no entry (e.g. a stale saved project after the entry
    // moved). Reset the demo's saved state with `?cdoMockReset=1`.
    if (!compileFiles[ENTRY_FILE]) {
      pushConsole({
        level: 'error',
        text: `No entry file "${ENTRY_FILE}" in the project.`,
      });
      setStatus('error');
      return;
    }
    const mine = ++generation.current;
    setStatus('compiling');
    try {
      const moduleUrl = await pair.compile.compile(compileFiles, ENTRY_FILE);
      if (mine !== generation.current) {
        return; // a newer edit superseded this compile
      }
      const detail = (await pair.preview.load(moduleUrl)) as
        | ReloadReport
        | undefined;
      if (mine !== generation.current) {
        return;
      }
      // Tell the learner how the change was applied (hot reload feedback).
      if (detail?.mode === 'reconciled') {
        pushConsole({level: 'info', text: '↻ Applied changes live'});
      } else if (detail?.mode === 'restarted') {
        pushConsole({level: 'info', text: '↻ Restarted the game'});
      }
      setStatus('running');
    } catch (error) {
      if (mine !== generation.current) {
        return;
      }
      pushConsole({
        level: 'error',
        text: error instanceof Error ? error.message : String(error),
      });
      setStatus('error');
    }
  }

  const value: WorldRuntimeValue = {
    isConfigured: Boolean(sandboxUrl),
    previewIframe,
    consoleLog,
    clearConsole: () => setConsoleLog([]),
    status,
  };

  return (
    <WorldRuntimeContext.Provider value={value}>
      {/* The offscreen Blockly generator; only when a sandbox (and thus the
          compile pipeline) is active, so tests/unconfigured hosts don't inject
          Blockly. */}
      {sandboxUrl && (
        <BlocklyGenerator
          ref={blocklyGenerator}
          onReady={() => setGeneratorReady(true)}
        />
      )}
      {children}
    </WorldRuntimeContext.Provider>
  );
}

export function useWorldRuntime(): WorldRuntimeValue {
  const value = useContext(WorldRuntimeContext);
  if (!value) {
    throw new Error(
      'useWorldRuntime must be used within a WorldRuntimeProvider',
    );
  }
  return value;
}

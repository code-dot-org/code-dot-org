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

import {
  BlocklyGenerator,
  type BlocklyGeneratorHandle,
} from '../blockly/BlocklyGenerator';
import {refreshProjectDropdowns} from '../blockly/projectDropdowns';
import {projectRuleMetas} from '../blockly/projectModules';
import {ENTRY_FILE} from '../constants';

import {createGeneratedFileCache} from './generatedFiles';
import type {ReloadReport} from './messages';
import {projectAssets} from './projectAssets';
import {projectFiles, projectImageNames} from './projectFiles';
import {projectSignature} from './projectSignature';
import {WorldCompileManager} from './sandbox/worldCompileManager';
import {
  WorldPreviewManager,
  type ActorInfo,
} from './sandbox/worldPreviewManager';
import {thumbnailManifest} from './thumbnailManifest';
import {getAssetBaseUrl, getSandboxUrl} from './worldConfig';

/** A Blockly-authored file (.rule/.actor/.world) needs generation. */
const isBlocklyPath = (path: string): boolean =>
  /\.(rule|actor|world)$/.test(path);

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
  /** True once a first compile has succeeded (compiler warm, surfaces ready). */
  hasCompiled: boolean;
  /** Re-run the current program from the start. */
  restart: () => void;
  /** Hand the preview sandbox the lab's resolved letterbox / border colors. */
  setPreviewColors: (background: string, border: string) => void;
  /**
   * Introspect the actor templates (map editor): picker thumbnails and inspector
   * property schemas, both keyed by actor type (module path).
   */
  getActorInfo: (actorPaths: string[], worldPath: string) => Promise<ActorInfo>;
}

const WorldRuntimeContext = createContext<WorldRuntimeValue | null>(null);

const DEBOUNCE_MS = 300;
const MAX_CONSOLE_LINES = 500;

export function WorldRuntimeProvider({children}: {children: ReactNode}) {
  const sandboxUrl = useMemo(() => getSandboxUrl(), []);
  const {currentSources} = useSources<MultiFileSource>();

  // The project's own `.rule` rules, so the headless generator can register their
  // blocks (an actor using a project rule's set/get block then compiles).
  const projectRules = useMemo(
    () => projectRuleMetas(projectFiles(currentSources.source)),
    [currentSources],
  );

  const [consoleLog, setConsoleLog] = useState<ConsoleLine[]>([]);
  const [status, setStatus] = useState<RuntimeStatus>('idle');
  // True once the project has compiled at least once — esbuild is warm and the
  // sandbox surfaces are up, so thumbnails can be rendered without racing the
  // game's first compile. Flips before the game's Phaser boot, so the map editor
  // can render its picker in parallel with the game coming up.
  const [hasCompiled, setHasCompiled] = useState(false);
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

  // Generated modules, kept between compiles: an edit to one file leaves the
  // others byte-identical, and regenerating them is the expensive half of a
  // compile (generatedFiles).
  const generated = useRef(createGeneratedFileCache());

  /** Replace each Blockly file's JSON with its generated JavaScript. */
  const generateBlocklyFiles = (
    files: Record<string, string>,
  ): Record<string, string> => {
    const generator = blocklyGenerator.current;
    if (!generator) {
      return {...files};
    }
    // Every Blockly file — including a `.rule`, whose declarative scaffolding is
    // emitted from its metadata and whose action/query bodies are real generated
    // code — is turned into a world-lab module by the headless generator (which
    // needs the file's path for a `.rule`'s own imports).
    return generated.current.generateAll(
      files,
      isBlocklyPath,
      (contents, path) => generator.generate(contents, path),
    );
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
  // What the compiler can see, as one comparable string: everything except
  // which file the learner has open (projectSignature). Selecting a file used
  // to land here as an edit — a full regenerate, compile and preview reload for
  // byte-identical output.
  const signature = useMemo(
    () => projectSignature(currentSources.source),
    [currentSources],
  );
  // Read inside the effect, which no longer re-runs on every source change.
  const sourcesRef = useRef(currentSources);
  sourcesRef.current = currentSources;

  useEffect(() => {
    if (!managers.current) {
      return;
    }
    const source = sourcesRef.current.source;
    const files = projectFiles(source);
    // The project has not loaded yet (initial render / level still loading);
    // compiling an empty project would spuriously fail to find the entry.
    if (Object.keys(files).length === 0) {
      return;
    }
    // Refresh the project-derived dropdowns (animations, actor/world modules)
    // before the generator runs.
    refreshProjectDropdowns(files, projectImageNames(source));
    // Wait for the Blockly generator before compiling a project that has any
    // Blockly-authored files; this effect re-runs when it becomes ready.
    if (Object.keys(files).some(isBlocklyPath) && !generatorReady) {
      return;
    }
    // The first compile is the boot path — run it immediately; the debounce only
    // needs to coalesce a burst of subsequent edits. `generation` is still 0
    // until the first `compileAndLoad` starts, so this is exactly "have we booted
    // yet?" without a second flag.
    const delay = generation.current === 0 ? 0 : DEBOUNCE_MS;
    const handle = window.setTimeout(() => {
      void compileAndLoad(files);
    }, delay);
    return () => window.clearTimeout(handle);
    // compileAndLoad closes over refs and stable state setters only.
  }, [signature, generatorReady]);

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
    // Perf marks bracket the two expensive boot stages so boot time is
    // measurable without DevTools (whose wasm de-optimization inflates the
    // esbuild compile ~20x, swamping every other cost). `compile` spans the
    // esbuild-wasm bundle; `running` fires once the game is live. The demo reads
    // these; they are cheap and safe to keep in production for RUM.
    performance.mark('world:compile-start');
    try {
      // Compile the code and gather the uploaded image assets in parallel; the
      // preview needs both to draw the game.
      const [moduleUrl, assets] = await Promise.all([
        pair.compile.compile(compileFiles, ENTRY_FILE),
        // From the ref, not the render's closure: this runs after a debounce,
        // and the effect that scheduled it no longer re-runs on every change.
        projectAssets(sourcesRef.current.source),
      ]);
      if (mine !== generation.current) {
        return; // a newer edit superseded this compile
      }
      performance.mark('world:compile-done');
      // The compiler is now warm and the surfaces are up; let the map editor
      // start rendering thumbnails in parallel with the Phaser boot below.
      setHasCompiled(true);
      const detail = (await pair.preview.load(moduleUrl, assets)) as
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
      performance.mark('world:running');
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

  /** Re-run the current program from the start (the preview's restart button). */
  const restart = () => {
    const pair = managers.current;
    if (!pair) {
      return;
    }
    const files = projectFiles(currentSources.source);
    if (Object.keys(files).length === 0) {
      return;
    }
    // STOP tears the game down and resets the preview's reconcile baseline, so
    // the re-run starts fresh (actors back to their initial state) instead of
    // live-patching.
    pair.preview.stop();
    void compileAndLoad(files);
  };

  /**
   * Introspect each actor template for the map editor: compiles a throwaway
   * "thumbnail manifest" entry importing the given world (for its animations) and
   * actors, then has the preview surface draw a thumbnail and read each actor's
   * editable property schema — independent of the running game.
   */
  const getActorInfo = async (
    actorPaths: string[],
    worldPath: string,
  ): Promise<ActorInfo> => {
    const pair = managers.current;
    if (!pair || actorPaths.length === 0) {
      return {thumbnails: {}, schemas: {}};
    }
    const files = generateBlocklyFiles(projectFiles(currentSources.source));
    const entry = '__thumbnails__.js';
    const moduleUrl = await pair.compile.compile(
      {...files, [entry]: thumbnailManifest(actorPaths, worldPath)},
      entry,
    );
    return pair.preview.thumbnails(moduleUrl);
  };

  const value: WorldRuntimeValue = {
    isConfigured: Boolean(sandboxUrl),
    previewIframe,
    consoleLog,
    clearConsole: () => setConsoleLog([]),
    status,
    hasCompiled,
    restart,
    setPreviewColors: (background, border) =>
      void managers.current?.preview.setColors(background, border),
    getActorInfo,
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
          projectRules={projectRules}
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

import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';

import {
  getPaintTools,
  getToolboxPalette,
  toolboxXmlFromTray,
  trayFromToolboxXml,
  type PaintTool,
  type ToolboxPaletteEntry,
  type ToolboxTrayEntry,
} from '@code-dot-org/maze-lab';

import {authoringApi} from './api';
import type {LevelCheckResponse} from './api';
import {resolveWorkspaceOverrideXml, type WorkspaceMode} from './workspaceMode';

/**
 * Accumulated edits for a maze-family level's `overrideLevelDefinition`
 * patch — startDirection and the map fields (the FINAL IA REVISION's
 * 'visualization' panel section), the toolbox tray XML ('toolbox' section),
 * and the start/solution blocks XML plus target block count ('workspace'
 * section and the left rail's level-metadata tab). Every key optional:
 * Save only ever sends what the author actually touched.
 */
export interface LevelDraftPatch {
  startDirection?: string;
  serialized_maze?: string;
  maze?: string;
  toolboxBlocksXml?: string;
  startBlocksXml?: string;
  solutionBlocksXml?: string;
  ideal?: string;
  // 'true' only — set exclusively by accepting a passing-run offer; see
  // LevelDefinitionPatch's doc comment (authoring package) for why the
  // client never sends 'false' itself.
  solutionVerified?: string;
}

export interface UseLevelDraftArgs {
  experienceId: string | undefined;
  levelNumericId: number | undefined;
  /** Whether this experience's served levelProperties have arrived yet —
   * distinct from every individual field below being present/absent, which
   * (via `?? '<xml></xml>'` fallbacks) looks identical whether the query is
   * still in flight or the level genuinely has no toolbox override. Without
   * this, calling the hook unconditionally at mount (before the very first
   * fetch resolves) seeds `tray` from an empty XML string that then never
   * gets a chance to re-derive from the level's REAL toolboxBlocksXml — see
   * the mount/experience-reset effect below. */
  levelPropertiesLoaded: boolean;
  skin?: string;
  startDirection?: string;
  toolboxBlocksXml?: string;
  startBlocksXml?: string;
  solutionBlocksXml?: string;
  ideal?: string;
  solutionVerified: boolean;
  /** Every stage paint reports a fresh patch here — folded into the draft
   * the same way a startDirection edit is. */
  mapDraftPatch?: {serialized_maze: string; maze: string};
  workspaceMode: WorkspaceMode | undefined;
  onWorkspaceModeChange: (mode: WorkspaceMode | undefined) => void;
  onWorkspaceOverrideChange: (xml: string | undefined) => void;
  /** Every workspace mutation while a mode is active, reported up from the
   * stage. */
  workspaceCaptureXml?: string;
  /** A passing run recorded in 'mySolution' mode — the "save as solution?"
   * offer. undefined when there's nothing to offer. */
  solutionOffer?: {solutionBlocksXml: string; blocksUsed: number};
  onDismissSolutionOffer: () => void;
  /** Fires with the tray's freshly composed XML on every chip add/remove —
   * mirrors LessonPlayer's `toolboxDraftXml` state, which the live flyout
   * (MazeLab's toolboxOverride prop) reads; kept as a callback rather than
   * this hook owning that state directly because it also feeds
   * ExperienceStage independently of whether the panel is open. */
  onToolboxDraftChange: (xml: string) => void;
  /** Resets every LessonPlayer-owned stage-mirror piece this draft doesn't
   * itself hold (selectedPaintToolId, mapDraftPatch, toolboxDraftXml,
   * workspaceMode/workspaceOverrideXml/workspaceCaptureXml, solutionOffer)
   * — called once from `discard()` so "Discard" is one action regardless
   * of which panel section (or the left rail) the author clicked it from. */
  onDiscardStageState: () => void;
}

export interface UseLevelDraftResult {
  dirty: boolean;
  busy: boolean;
  error: string | null;
  checking: boolean;
  checkResult: LevelCheckResponse | null;
  dismissCheckResult: () => void;
  /** 'visualization' section fields. */
  currentStartDirection: string;
  setStartDirection: (value: string) => void;
  paintTools: PaintTool[];
  /** 'toolbox' section fields. */
  tray: ToolboxTrayEntry[];
  availableBlocks: ToolboxPaletteEntry[];
  addChip: (entry: ToolboxTrayEntry) => void;
  removeChip: (id: string) => void;
  /** 'workspace' section fields, also read by the left rail's Level tab
   * for the solution-status line. */
  effectiveSolutionXml?: string;
  effectiveIdeal?: string;
  effectiveVerified: boolean;
  setIdeal: (value: string) => void;
  switchWorkspaceMode: (nextMode: WorkspaceMode) => void;
  acceptSolutionOffer: () => void;
  /** Shared actions. */
  submit: () => Promise<void>;
  runCheck: () => Promise<void>;
  discard: () => void;
}

/**
 * Owns the single shared draft behind the FINAL IA REVISION's three
 * maze-editing panel sections (visualization/toolbox/workspace) and the
 * left rail's level-metadata Level tab — one `overrideLevelDefinition`
 * patch, "editing ITS OWN properties" panels notwithstanding, because
 * that's the wire format's actual shape (one patch, several keys; see
 * docs/prototypes/author-mode-level-editor.md §1.4). Save from any of the
 * three panel sections saves everything pending across all three — there
 * is only one underlying patch to save.
 *
 * Lifted out of LevelRail (which used to be this file's only caller,
 * before the FINAL IA REVISION moved the map/toolbox/workspace surfaces out
 * of the left rail) so PropertiesPanel's three new sections and LevelRail's
 * slimmed Level tab can share one draft instead of forking it. Call once
 * per active experience, at the shared ancestor (LessonPlayer) — reset it
 * on both a Discard and a navigation away via `discard()`, the same way
 * LessonPlayer already resets its own level-editing state in `selectIndex`.
 */
export function useLevelDraft({
  experienceId,
  levelNumericId,
  levelPropertiesLoaded,
  skin,
  startDirection,
  toolboxBlocksXml,
  startBlocksXml,
  solutionBlocksXml,
  ideal,
  solutionVerified,
  mapDraftPatch,
  workspaceMode,
  onWorkspaceModeChange,
  onWorkspaceOverrideChange,
  workspaceCaptureXml,
  solutionOffer,
  onDismissSolutionOffer,
  onToolboxDraftChange,
  onDiscardStageState,
}: UseLevelDraftArgs): UseLevelDraftResult {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<LevelDraftPatch>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<LevelCheckResponse | null>(
    null,
  );
  const [checking, setChecking] = useState(false);
  const [tray, setTray] = useState<ToolboxTrayEntry[]>(() =>
    trayFromToolboxXml(toolboxBlocksXml ?? '<xml></xml>', skin ?? 'birds'),
  );
  // The author's in-progress solution attempt this session, not yet
  // accepted into the Save draft — separate from draft.solutionBlocksXml
  // (see resolveWorkspaceOverrideXml's doc comment for why).
  const [solutionAttemptXml, setSolutionAttemptXml] = useState<
    string | undefined
  >();

  const currentStartDirection = draft.startDirection ?? startDirection ?? '1';
  const dirty = Object.keys(draft).length > 0;
  const paintTools = skin ? getPaintTools(skin) : [];
  const palette = skin ? getToolboxPalette(skin) : [];
  const trayIds = new Set(tray.map(t => t.id));
  const availableBlocks = palette.filter(entry => !trayIds.has(entry.id));
  const effectiveSolutionXml = draft.solutionBlocksXml ?? solutionBlocksXml;
  const effectiveIdeal = draft.ideal ?? ideal;
  const effectiveVerified =
    draft.solutionVerified === 'true' || solutionVerified;

  // Resets every piece of local draft state on a navigation to a different
  // experience — mirrors the reset a `key={active.id}` remount used to give
  // this state for free back when it lived directly in a LevelRail-only
  // component. ALSO fires again the moment levelPropertiesLoaded flips to
  // true for the SAME experience: this hook is called unconditionally at
  // LessonPlayer's top level (rules of hooks), so its very first render for
  // a freshly selected experience happens before that level's properties
  // query has resolved — toolboxBlocksXml/skin are still undefined then,
  // and without this second firing `tray` would be permanently seeded from
  // an empty toolbox rather than the level's real one. Once loaded, further
  // refetches of the SAME experience (e.g. after Save) don't flip
  // levelPropertiesLoaded again, so an in-progress edit is never discarded
  // out from under the author — that's what excluding
  // startDirection/startBlocksXml/etc. from these deps is for too.
  useEffect(() => {
    setDraft({});
    setTray(trayFromToolboxXml(toolboxBlocksXml ?? '<xml></xml>', skin ?? 'birds'));
    setSolutionAttemptXml(undefined);
    setError(null);
    setCheckResult(null);
  }, [experienceId, levelPropertiesLoaded]);

  // Every stage paint reports a fresh {serialized_maze, maze} patch — fold
  // it into the Save draft, mirroring a startDirection edit.
  useEffect(() => {
    if (mapDraftPatch) {
      setDraft(prev => ({...prev, ...mapDraftPatch}));
    }
  }, [mapDraftPatch]);

  // Every workspace mutation while a mode is active reports a fresh
  // capture here. Student-start's capture IS the Save draft (whatever's on
  // the canvas at Save time becomes startBlocksXml); my-solution's capture
  // is only a session-scratch attempt — the sole way solutionBlocksXml
  // enters the draft is accepting a passing-run offer (see
  // acceptSolutionOffer below), never a bare capture of an unproven canvas.
  useEffect(() => {
    if (workspaceCaptureXml === undefined) {
      return;
    }
    if (workspaceMode === 'studentStart') {
      setDraft(prev => ({...prev, startBlocksXml: workspaceCaptureXml}));
    } else if (workspaceMode === 'mySolution') {
      setSolutionAttemptXml(workspaceCaptureXml);
    }
  }, [workspaceCaptureXml, workspaceMode]);

  // Switches the shared workspace between "Student start" and "My
  // solution" — clicking the already-active mode turns editing off
  // without touching the loaded program (see MazeLab's startBlocks
  // comment for why turning off must never itself trigger a reload).
  const switchWorkspaceMode = (nextMode: WorkspaceMode) => {
    const targetMode = workspaceMode === nextMode ? undefined : nextMode;
    onWorkspaceModeChange(targetMode);
    if (targetMode) {
      onWorkspaceOverrideChange(
        resolveWorkspaceOverrideXml(
          targetMode,
          {mySolution: solutionAttemptXml},
          {studentStart: draft.startBlocksXml, mySolution: draft.solutionBlocksXml},
          {studentStart: startBlocksXml, mySolution: solutionBlocksXml},
        ),
      );
    }
  };

  const acceptSolutionOffer = () => {
    if (!solutionOffer) {
      return;
    }
    setDraft(prev => ({
      ...prev,
      solutionBlocksXml: solutionOffer.solutionBlocksXml,
      ideal: String(solutionOffer.blocksUsed),
      solutionVerified: 'true',
    }));
    onDismissSolutionOffer();
  };

  const addChip = (entry: ToolboxTrayEntry) => {
    const nextTray = [...tray, entry];
    setTray(nextTray);
    const xml = toolboxXmlFromTray(nextTray);
    onToolboxDraftChange(xml);
    setDraft(prev => ({...prev, toolboxBlocksXml: xml}));
  };

  const removeChip = (id: string) => {
    const nextTray = tray.filter(t => t.id !== id);
    setTray(nextTray);
    const xml = toolboxXmlFromTray(nextTray);
    onToolboxDraftChange(xml);
    setDraft(prev => ({...prev, toolboxBlocksXml: xml}));
  };

  const submit = async () => {
    if (busy || !dirty || levelNumericId === undefined || !experienceId) {
      return;
    }
    setBusy(true);
    setError(null);
    setCheckResult(null);
    try {
      await authoringApi.applyChange({
        op: 'overrideLevelDefinition',
        experienceId,
        patch: draft,
      });
      await queryClient.invalidateQueries({
        queryKey: ['authoring', 'levelProperties', levelNumericId],
      });
      setDraft({});
      // A painted map, toolbox, or start arrangement that breaks solvability
      // should tell the author immediately, not silently — but a failed
      // check is still a successful Save (Save is never gated on
      // verification), so this runs after the invalidate/reset above
      // regardless of outcome.
      try {
        setCheckResult(await authoringApi.checkLevel(levelNumericId));
      } catch (checkError) {
        setCheckResult({
          ok: false,
          mode: 'palette',
          reasons: [
            checkError instanceof Error ? checkError.message : 'check failed',
          ],
        });
      }
    } catch {
      setError('That change failed to apply.');
    } finally {
      setBusy(false);
    }
  };

  const runCheck = async () => {
    if (levelNumericId === undefined) {
      return;
    }
    setChecking(true);
    try {
      setCheckResult(await authoringApi.checkLevel(levelNumericId));
    } catch (checkError) {
      setCheckResult({
        ok: false,
        mode: 'palette',
        reasons: [
          checkError instanceof Error ? checkError.message : 'check failed',
        ],
      });
    } finally {
      setChecking(false);
    }
  };

  const discard = () => {
    setDraft({});
    setTray(trayFromToolboxXml(toolboxBlocksXml ?? '<xml></xml>', skin ?? 'birds'));
    setSolutionAttemptXml(undefined);
    setError(null);
    onDiscardStageState();
  };

  return {
    dirty,
    busy,
    error,
    checking,
    checkResult,
    dismissCheckResult: () => setCheckResult(null),
    currentStartDirection,
    setStartDirection: (value: string) =>
      setDraft(prev => ({...prev, startDirection: value})),
    paintTools,
    tray,
    availableBlocks,
    addChip,
    removeChip,
    effectiveSolutionXml,
    effectiveIdeal,
    effectiveVerified,
    setIdeal: (value: string) => setDraft(prev => ({...prev, ideal: value})),
    switchWorkspaceMode,
    acceptSolutionOffer,
    submit,
    runCheck,
    discard,
  };
}

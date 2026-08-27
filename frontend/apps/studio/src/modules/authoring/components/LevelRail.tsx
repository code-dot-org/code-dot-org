import {Button, Typography} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';

import type {Experience, ExistingLevelExperience} from '@code-dot-org/authoring';
import {
  getPaintTools,
  getToolboxPalette,
  toolboxXmlFromTray,
  trayFromToolboxXml,
  type ToolboxTrayEntry,
} from '@code-dot-org/maze-lab';

import {authoringApi, useLevelProperties} from '@/modules/authoring';
import type {LevelCheckResponse} from '@/modules/authoring';

import {
  resolveWorkspaceOverrideXml,
  type WorkspaceMode,
} from '../workspaceMode';

import {LevelCheckCard} from './ExperienceStage';
import OutlineRail from './OutlineRail';

import styles from './authoring.module.scss';

interface LevelRailProps {
  lessonId: string;
  experiences: Experience[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAskAiAt: (position: number) => void;
  active: Experience | undefined;
  selectedPaintToolId?: string;
  onSelectPaintTool: (id: string | undefined) => void;
  mapDraftPatch?: {serialized_maze: string; maze: string};
  onToolboxDraftChange: (xml: string) => void;
  /** "Student start | My solution" — see MazeLabEditingProps.workspaceMode. */
  workspaceMode: WorkspaceMode | undefined;
  onWorkspaceModeChange: (mode: WorkspaceMode | undefined) => void;
  /** Pushes the freshly resolved program down to the stage on a mode
   * switch — see LessonPlayer's `workspaceOverrideXml` state comment. */
  onWorkspaceOverrideChange: (xml: string | undefined) => void;
  /** Every workspace mutation while a mode is active, reported up from the
   * stage (LessonPlayer's `workspaceCaptureXml`). */
  workspaceCaptureXml?: string;
  /** A passing run recorded in 'mySolution' mode — the "save as solution?"
   * offer. undefined when there's nothing to offer. */
  solutionOffer?: {solutionBlocksXml: string; blocksUsed: number};
  onDismissSolutionOffer: () => void;
  onDirtyChange: (dirty: boolean) => void;
  /** Discards every in-progress edit (draft, tray, paint tool, workspace
   * mode) without saving — the rail's equivalent of the former right
   * panel's Cancel, now that there is no panel to close. */
  onDiscard: () => void;
}

/**
 * Left rail — "Outline" and "Level" sibling tabs (Contentful's own
 * Components/Layers/Settings sibling-tab model, per the CMS-IA research at
 * docs/prototypes/author-mode-cms-ux-research.md). Final layout after two
 * earlier iterations this same pass: a right-panel "Level" click-target
 * (rejected — level-wide settings are page settings, not a stage
 * click-target), then replacing the outline outright whenever a maze level
 * is active (rejected — the research's #3 gap: it lost outline navigation
 * and the type chips while a level's settings were showing). Sibling tabs
 * keep both: Outline stays the default, the Level tab lights up only for a
 * maze-family experience, and BOTH stay mounted (only one visible) so
 * switching tabs never discards an in-progress edit — Save/Discard inside
 * the Level tab are still the only way to resolve one, same as before.
 */
export default function LevelRail({
  lessonId,
  experiences,
  activeIndex,
  onSelect,
  onAskAiAt,
  active,
  selectedPaintToolId,
  onSelectPaintTool,
  mapDraftPatch,
  onToolboxDraftChange,
  workspaceMode,
  onWorkspaceModeChange,
  onWorkspaceOverrideChange,
  workspaceCaptureXml,
  solutionOffer,
  onDismissSolutionOffer,
  onDirtyChange,
  onDiscard,
}: LevelRailProps) {
  const [activeTab, setActiveTab] = useState<'outline' | 'level'>('outline');
  const levelNumericId =
    active?.kind === 'existingLevel' ? active.levelNumericId : undefined;
  const {data: properties} = useLevelProperties(levelNumericId ?? -1);
  const levelProps =
    levelNumericId !== undefined
      ? properties?.[String(levelNumericId)]
      : undefined;
  const appName = levelProps?.appName as string | undefined;
  const levelTabAvailable =
    active?.kind === 'existingLevel' &&
    appName === 'maze' &&
    levelNumericId !== undefined;

  // Falls back to Outline the moment the Level tab stops applying (the
  // author navigated to a non-maze experience via the top progress bubbles
  // while the Level tab was showing) — otherwise the tab bar would show a
  // selected-but-disabled Level tab with nothing under it.
  useEffect(() => {
    if (!levelTabAvailable && activeTab === 'level') {
      setActiveTab('outline');
    }
  }, [levelTabAvailable, activeTab]);

  return (
    <div className={styles.levelRailContainer}>
      <div className={styles.railTabs} role="tablist" aria-label="Left rail">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'outline'}
          className={
            activeTab === 'outline' ? styles.railTabActive : styles.railTab
          }
          onClick={() => setActiveTab('outline')}
        >
          Outline
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'level'}
          disabled={!levelTabAvailable}
          className={
            activeTab === 'level' ? styles.railTabActive : styles.railTab
          }
          onClick={() => setActiveTab('level')}
        >
          Level
        </button>
      </div>
      <div
        className={
          activeTab === 'outline' ? styles.railTabBody : styles.railTabBodyHidden
        }
      >
        <OutlineRail
          lessonId={lessonId}
          experiences={experiences}
          activeIndex={activeIndex}
          onSelect={onSelect}
          onAskAiAt={onAskAiAt}
        />
      </div>
      {levelTabAvailable &&
        active?.kind === 'existingLevel' &&
        levelNumericId !== undefined && (
          <div
            className={
              activeTab === 'level'
                ? styles.railTabBody
                : styles.railTabBodyHidden
            }
          >
            <LevelSettings
              key={active.id}
              experience={active}
              levelNumericId={levelNumericId}
              skin={levelProps?.skin as string | undefined}
              startDirection={levelProps?.startDirection as string | undefined}
              toolboxBlocksXml={
                levelProps?.toolboxBlocksXml as string | undefined
              }
              startBlocksXml={levelProps?.startBlocksXml as string | undefined}
              solutionBlocksXml={
                levelProps?.solutionBlocksXml as string | undefined
              }
              ideal={levelProps?.ideal as string | undefined}
              solutionVerified={levelProps?.solutionVerified === 'true'}
              onDirtyChange={onDirtyChange}
              selectedPaintToolId={selectedPaintToolId}
              onSelectPaintTool={onSelectPaintTool}
              mapDraftPatch={mapDraftPatch}
              onToolboxDraftChange={onToolboxDraftChange}
              workspaceMode={workspaceMode}
              onWorkspaceModeChange={onWorkspaceModeChange}
              onWorkspaceOverrideChange={onWorkspaceOverrideChange}
              workspaceCaptureXml={workspaceCaptureXml}
              solutionOffer={solutionOffer}
              onDismissSolutionOffer={onDismissSolutionOffer}
              onDiscard={onDiscard}
            />
          </div>
        )}
    </div>
  );
}

// Mirrors PropertiesPanel.tsx's START_DIRECTION_OPTIONS/tiles.ts's Direction
// enum comment verbatim — kept as its own copy for the reason given there.
const START_DIRECTION_OPTIONS = [
  {value: '0', label: 'North'},
  {value: '1', label: 'East'},
  {value: '2', label: 'South'},
  {value: '3', label: 'West'},
] as const;

/** Accumulated edits for the level rail — startDirection and the map fields
 * (both carried over from the right panel's former 'level' section), the
 * toolbox tray and student-start XML Pass C adds, and the solution
 * fields Pass D adds. Every key optional: Save only ever sends what the
 * author actually touched. */
interface LevelDraftPatch {
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

function LevelSettings({
  experience,
  levelNumericId,
  skin,
  startDirection,
  toolboxBlocksXml,
  startBlocksXml,
  solutionBlocksXml,
  ideal,
  solutionVerified,
  onDirtyChange,
  selectedPaintToolId,
  onSelectPaintTool,
  mapDraftPatch,
  onToolboxDraftChange,
  workspaceMode,
  onWorkspaceModeChange,
  onWorkspaceOverrideChange,
  workspaceCaptureXml,
  solutionOffer,
  onDismissSolutionOffer,
  onDiscard,
}: {
  experience: ExistingLevelExperience;
  levelNumericId: number;
  skin?: string;
  startDirection?: string;
  toolboxBlocksXml?: string;
  startBlocksXml?: string;
  solutionBlocksXml?: string;
  ideal?: string;
  solutionVerified: boolean;
  onDirtyChange: (dirty: boolean) => void;
  selectedPaintToolId?: string;
  onSelectPaintTool: (id: string | undefined) => void;
  mapDraftPatch?: {serialized_maze: string; maze: string};
  onToolboxDraftChange: (xml: string) => void;
  workspaceMode: WorkspaceMode | undefined;
  onWorkspaceModeChange: (mode: WorkspaceMode | undefined) => void;
  onWorkspaceOverrideChange: (xml: string | undefined) => void;
  workspaceCaptureXml?: string;
  solutionOffer?: {solutionBlocksXml: string; blocksUsed: number};
  onDismissSolutionOffer: () => void;
  onDiscard: () => void;
}) {
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
  // (see resolveWorkspaceOverrideXml's doc comment for why). Resets with
  // the rest of this component's state whenever the active experience
  // changes (LevelRail mounts LevelSettings with key={active.id}).
  const [solutionAttemptXml, setSolutionAttemptXml] = useState<
    string | undefined
  >();
  const currentValue = draft.startDirection ?? startDirection ?? '1';
  const dirty = Object.keys(draft).length > 0;
  const paintTools = skin ? getPaintTools(skin) : [];
  const palette = skin ? getToolboxPalette(skin) : [];
  const trayIds = new Set(tray.map(t => t.id));
  const availableBlocks = palette.filter(entry => !trayIds.has(entry.id));
  const effectiveSolutionXml = draft.solutionBlocksXml ?? solutionBlocksXml;
  const effectiveIdeal = draft.ideal ?? ideal;
  // 'true' set by accepting the current offer; otherwise whatever the
  // server last held. Never inferred as true from stale served state after
  // this draft has touched the environment — mergeDefinitionOverride's
  // staleness rule already degraded the SERVED value itself the moment
  // that happened, so trusting `solutionVerified` here (not re-deriving it
  // client-side) is the simplest honest reading of "is it still proven".
  const effectiveVerified = draft.solutionVerified === 'true' || solutionVerified;

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  // Every stage paint reports a fresh {serialized_maze, maze} patch here —
  // fold it into the Save draft the same way a startDirection edit does.
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
    if (busy || !dirty) {
      return;
    }
    setBusy(true);
    setError(null);
    setCheckResult(null);
    try {
      await authoringApi.applyChange({
        op: 'overrideLevelDefinition',
        experienceId: experience.id,
        patch: draft,
      });
      await queryClient.invalidateQueries({
        queryKey: ['authoring', 'levelProperties', levelNumericId],
      });
      setDraft({});
      // A painted map, toolbox, or start arrangement that breaks solvability
      // should tell the author immediately, not silently — but a failed
      // check is still a successful Save (§1.10: Save is never gated on
      // verification), so this runs after the invalidate/reset above
      // regardless of outcome.
      try {
        setCheckResult(await authoringApi.checkLevel(levelNumericId));
      } catch (checkError) {
        setCheckResult({
          ok: false,
          mode: 'palette',
          reasons: [
            checkError instanceof Error
              ? checkError.message
              : 'check failed',
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

  return (
    <form
      className={styles.levelRail}
      aria-label="Level settings"
      onSubmit={e => {
        e.preventDefault();
        void submit();
      }}
    >
      <Typography variant="h6" component="h2">
        Level
      </Typography>

      <label htmlFor="level-rail-start-direction">Start direction</label>
      <select
        id="level-rail-start-direction"
        value={currentValue}
        onChange={e =>
          setDraft(prev => ({...prev, startDirection: e.target.value}))
        }
      >
        {START_DIRECTION_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {paintTools.length > 0 && (
        <div className={styles.paintPalette}>
          <Typography variant="body4" component="span">
            Paint the map — click a tile below, then a cell on the stage.
          </Typography>
          <div className={styles.paintPaletteTools}>
            {paintTools.map(tool => (
              <Button
                key={tool.id}
                type="button"
                size="small"
                variant={
                  selectedPaintToolId === tool.id ? 'contained' : 'outlined'
                }
                aria-pressed={selectedPaintToolId === tool.id}
                onClick={() =>
                  onSelectPaintTool(
                    selectedPaintToolId === tool.id ? undefined : tool.id,
                  )
                }
              >
                {tool.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.toolboxTray}>
        <Typography variant="body4" component="span">
          Student toolbox
        </Typography>
        <div className={styles.toolboxTrayColumns}>
          <div className={styles.toolboxTrayColumn}>
            <Typography variant="body4" component="span">
              Available blocks
            </Typography>
            <ul className={styles.toolboxChipList}>
              {availableBlocks.map(entry => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={styles.toolboxChip}
                    onClick={() => addChip({...entry})}
                    aria-label={`Add ${entry.label} to the student toolbox`}
                  >
                    + {entry.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.toolboxTrayColumn}>
            <Typography variant="body4" component="span">
              In the toolbox
            </Typography>
            <ul className={styles.toolboxChipList}>
              {tray.map(entry => (
                <li key={entry.id}>
                  <span className={styles.toolboxChip}>
                    {entry.label}
                    <button
                      type="button"
                      aria-label={`Remove ${entry.label} from the student toolbox`}
                      onClick={() => removeChip(entry.id)}
                    >
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.paintPalette}>
        <Typography variant="body4" component="span">
          Workspace — arrange blocks on the stage below.
        </Typography>
        <div className={styles.paintPaletteTools}>
          <Button
            type="button"
            size="small"
            variant={workspaceMode === 'studentStart' ? 'contained' : 'outlined'}
            aria-pressed={workspaceMode === 'studentStart'}
            onClick={() => switchWorkspaceMode('studentStart')}
          >
            Student start
          </Button>
          <Button
            type="button"
            size="small"
            variant={workspaceMode === 'mySolution' ? 'contained' : 'outlined'}
            aria-pressed={workspaceMode === 'mySolution'}
            onClick={() => switchWorkspaceMode('mySolution')}
          >
            My solution
          </Button>
        </div>
      </div>

      <div className={styles.solutionStatus}>
        <Typography variant="body4" component="span">
          {effectiveSolutionXml
            ? effectiveVerified
              ? `Solution: verified by author run (${effectiveIdeal ?? '?'} blocks)`
              : 'Solution: saved, not verified since the last change'
            : 'No verified solution'}
        </Typography>
        {effectiveSolutionXml && (
          <label htmlFor="level-rail-ideal">
            Target block count
            <input
              id="level-rail-ideal"
              type="number"
              min={0}
              value={effectiveIdeal ?? ''}
              onChange={e =>
                setDraft(prev => ({...prev, ideal: e.target.value}))
              }
            />
          </label>
        )}
      </div>

      {solutionOffer && (
        <div className={styles.solutionOfferCard}>
          <Typography variant="body4" component="span">
            Your run passed — save as the level's solution? (
            {solutionOffer.blocksUsed} blocks)
          </Typography>
          <div className={styles.composerActions}>
            <Button
              type="button"
              size="small"
              variant="outlined"
              onClick={onDismissSolutionOffer}
            >
              Not now
            </Button>
            <Button
              type="button"
              size="small"
              variant="contained"
              onClick={acceptSolutionOffer}
            >
              Save as solution
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Typography variant="body4" role="status" className={styles.inlineError}>
          {error}
        </Typography>
      )}
      {checkResult && (
        <LevelCheckCard
          result={checkResult}
          onDismiss={() => setCheckResult(null)}
        />
      )}
      <div className={styles.composerActions}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() => void runCheck()}
          disabled={checking}
        >
          {checking ? 'Checking…' : 'Check level'}
        </Button>
        {dirty && (
          <Button
            type="button"
            size="small"
            variant="outlined"
            disabled={busy}
            onClick={() => {
              setDraft({});
              setTray(
                trayFromToolboxXml(
                  toolboxBlocksXml ?? '<xml></xml>',
                  skin ?? 'birds',
                ),
              );
              setSolutionAttemptXml(undefined);
              onDiscard();
            }}
          >
            Discard
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={busy || !dirty}
        >
          Save
        </Button>
      </div>
    </form>
  );
}

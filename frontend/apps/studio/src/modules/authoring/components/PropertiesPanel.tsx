import {Button, IconButton, Typography} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';

import type {
  ExistingLevelExperience,
  GenericLevelData,
  WidgetDescriptor,
  WidgetExperience,
} from '@code-dot-org/authoring';
import {useEscapeKeyHandler} from '@code-dot-org/component-library/common/hooks';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {chipBlockType, isBeeSkin} from '@code-dot-org/maze-lab';

import {
  authoringApi,
  experienceTypeLabel,
  useLevelProperties,
  useWidget,
} from '@/modules/authoring';

import type {UseLevelDraftResult} from '../levelDraft';
import type {WorkspaceMode} from '../workspaceMode';

import {LevelCheckCard, type PanelSection} from './ExperienceStage';
import {ProposeWidgetButton} from './ProposeWidgetButton';

import styles from './authoring.module.scss';

// Same reasoning as the field that used to live in LevelInstructions.tsx:
// shortInstructions is a CSF/Blockly-era field lab2 labs never read, and
// music-lab only displays longInstructions.
const SHORT_INSTRUCTIONS_RELEVANT_BY_APP_NAME: Record<string, boolean> = {
  music: false,
};

// Mirrors LevelRail's original START_DIRECTION_OPTIONS/tiles.ts's Direction
// enum comment verbatim — kept as its own copy for the reason given there:
// this package can't depend on the maze package's own enum, and the two
// only need to stay structurally compatible.
const START_DIRECTION_OPTIONS = [
  {value: '0', label: 'North'},
  {value: '1', label: 'East'},
  {value: '2', label: 'South'},
  {value: '3', label: 'West'},
] as const;

// Bee only (Gap #3) — the two real values dashboard/config/levels/custom/
// maze .level files set (grepped); purpleNectarHidden hides each flower's
// nectar count from the player, changing the puzzle.
const FLOWER_TYPE_OPTIONS = [
  {value: 'redWithNectar', label: 'Red — nectar counts visible'},
  {value: 'purpleNectarHidden', label: 'Purple — nectar counts hidden'},
] as const;

interface PropertiesPanelProps {
  /** content never reaches this panel — LessonPlayer's edit-bar pencil
   * covers that kind, not a stage click target (see markdownEditable). */
  experience: ExistingLevelExperience | WidgetExperience;
  section: PanelSection;
  onClose: () => void;
  /** Reports whether the panel has an unsaved edit — LessonPlayer refuses to
   * switch the panel to a different section while this is true, so an
   * in-progress edit is never discarded by a stray click elsewhere. */
  onDirtyChange: (dirty: boolean) => void;
  /** The shared draft behind visualization/toolbox/workspace — undefined
   * for 'instructions', which has its own independent op/dirty tracking.
   * See levelDraft.ts. */
  levelDraft?: UseLevelDraftResult;
  selectedPaintToolId?: string;
  onSelectPaintTool: (id: string | undefined) => void;
  onFillAll: (toolId: string) => void;
  workspaceMode: WorkspaceMode | undefined;
  solutionOffer?: {solutionBlocksXml: string; blocksUsed: number};
  onDismissSolutionOffer: () => void;
}

/**
 * Right-side properties panel — the lesson stage's click-to-edit surface.
 * Four sections, one per logical stage component (product owner's FINAL IA
 * REVISION, 8/27, see docs/prototypes/author-mode-properties-panel.md §5 for
 * the earlier single-section design this supersedes): instructions
 * (markdown), visualization (map palette + start direction + skin facts),
 * toolbox (the student toolbox chip tray), and workspace (Student start/My
 * solution mode + capture status + the record-solution offer). Level-WIDE
 * settings (title, target block count, solution status, Check level) are
 * page settings and live in the left rail (LevelRail.tsx) instead — not a
 * stage click-target.
 */
export default function PropertiesPanel({
  experience,
  section,
  onClose,
  onDirtyChange,
  levelDraft,
  selectedPaintToolId,
  onSelectPaintTool,
  onFillAll,
  workspaceMode,
  solutionOffer,
  onDismissSolutionOffer,
}: PropertiesPanelProps) {
  useEscapeKeyHandler(onClose);

  if (experience.kind === 'widget') {
    return (
      <div className={styles.propertiesPanel}>
        <PanelHeader title={sectionTitle(section, experience)} onClose={onClose} />
        <WidgetFields
          experience={experience}
          onClose={onClose}
          onDirtyChange={onDirtyChange}
        />
      </div>
    );
  }

  const levelNumericId = experience.levelNumericId;
  const {data: properties} = useLevelProperties(levelNumericId);
  const levelProps =
    levelNumericId !== undefined
      ? properties?.[String(levelNumericId)]
      : undefined;
  const appName = levelProps?.appName as string | undefined;

  return (
    <div className={styles.propertiesPanel}>
      <PanelHeader title={sectionTitle(section, experience)} onClose={onClose} />
      {section === 'generic' ? (
        <GenericFields
          experience={experience}
          onClose={onClose}
          onDirtyChange={onDirtyChange}
        />
      ) : levelNumericId === undefined ? (
        <Typography variant="body4">Nothing to edit here.</Typography>
      ) : section === 'instructions' ? (
        <InstructionsFields
          experienceId={experience.id}
          levelNumericId={levelNumericId}
          appName={appName}
          shortInstructions={levelProps?.shortInstructions as string | undefined}
          longInstructions={levelProps?.longInstructions as string | undefined}
          onClose={onClose}
          onDirtyChange={onDirtyChange}
        />
      ) : !levelDraft ? (
        <Typography variant="body4">Nothing to edit here.</Typography>
      ) : section === 'visualization' ? (
        <VisualizationFields
          levelDraft={levelDraft}
          skin={levelProps?.skin as string | undefined}
          map={levelProps?.maze as string | undefined}
          selectedPaintToolId={selectedPaintToolId}
          onSelectPaintTool={onSelectPaintTool}
          onFillAll={onFillAll}
          onClose={onClose}
          onDirtyChange={onDirtyChange}
        />
      ) : section === 'toolbox' ? (
        <ToolboxFields
          levelDraft={levelDraft}
          onClose={onClose}
          onDirtyChange={onDirtyChange}
        />
      ) : (
        <WorkspaceFields
          // LessonPlayer already keys the whole PropertiesPanel on
          // `${active.id}-${panelSection}`, but that key lives one
          // component up — anything that ever hoists WorkspaceFields out
          // from under it (or renders it a second way) would silently
          // inherit this component's own useState(false) across a
          // different experience. Keying it here too costs nothing and
          // removes the ambiguity: "show all blocks" always starts
          // unchecked for a level it hasn't been explicitly checked on.
          key={experience.id}
          levelDraft={levelDraft}
          workspaceMode={workspaceMode}
          solutionOffer={solutionOffer}
          onDismissSolutionOffer={onDismissSolutionOffer}
          onClose={onClose}
          onDirtyChange={onDirtyChange}
        />
      )}
    </div>
  );
}

function PanelHeader({title, onClose}: {title: string; onClose: () => void}) {
  return (
    <div className={styles.propertiesPanelHeader}>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      <IconButton size="small" aria-label="Close panel" onClick={onClose}>
        <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
      </IconButton>
    </div>
  );
}

function sectionTitle(
  section: PanelSection,
  experience: ExistingLevelExperience | WidgetExperience,
): string {
  switch (section) {
    case 'instructions':
      return 'Instructions';
    case 'visualization':
      return 'Visualization';
    case 'toolbox':
      return 'Toolbox';
    case 'workspace':
      return 'Workspace';
    case 'generic':
      return experienceTypeLabel(experience);
    case 'widget':
      return 'Widget';
  }
}

function InstructionsFields({
  experienceId,
  levelNumericId,
  appName,
  shortInstructions,
  longInstructions,
  onClose,
  onDirtyChange,
}: {
  experienceId: string;
  levelNumericId: number;
  appName?: string;
  shortInstructions?: string;
  longInstructions?: string;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const showShortInstructionsField =
    SHORT_INSTRUCTIONS_RELEVANT_BY_APP_NAME[appName ?? ''] ?? true;
  const [shortValue, setShortValue] = useState(shortInstructions ?? '');
  const [longValue, setLongValue] = useState(longInstructions ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onDirtyChange(
      shortValue !== (shortInstructions ?? '') ||
        longValue !== (longInstructions ?? ''),
    );
  }, [shortValue, longValue, shortInstructions, longInstructions, onDirtyChange]);

  const submit = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authoringApi.applyChange({
        op: 'overrideLevelInstructions',
        experienceId,
        patch: {shortInstructions: shortValue, longInstructions: longValue},
      });
      await queryClient.invalidateQueries({
        queryKey: ['authoring', 'levelProperties', levelNumericId],
      });
      onClose();
    } catch {
      setError('That change failed to apply.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className={styles.propertiesPanelForm}
      onSubmit={e => {
        e.preventDefault();
        void submit();
      }}
    >
      {showShortInstructionsField && (
        <textarea
          aria-label="Short instructions"
          placeholder="Short instructions (optional)"
          value={shortValue}
          onChange={e => setShortValue(e.target.value)}
        />
      )}
      <textarea
        aria-label="Instructions (markdown)"
        placeholder="Instructions shown to the learner…"
        value={longValue}
        onChange={e => setLongValue(e.target.value)}
      />
      {error && (
        <Typography variant="body4" role="status" className={styles.inlineError}>
          {error}
        </Typography>
      )}
      <div className={styles.composerActions}>
        <Button variant="outlined" size="small" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" size="small" disabled={busy}>
          Save
        </Button>
      </div>
    </form>
  );
}

/** Shared error/Discard/Save/Close row for the three levelDraft-backed
 * sections below — one draft, so Save from any of them saves everything
 * pending across all three (see levelDraft.ts's doc comment). */
function DraftSectionFooter({
  levelDraft,
  onClose,
}: {
  levelDraft: UseLevelDraftResult;
  onClose: () => void;
}) {
  const {dirty, busy, error, checkResult, dismissCheckResult, submit, discard} =
    levelDraft;
  return (
    <>
      {error && (
        <Typography variant="body4" role="status" className={styles.inlineError}>
          {error}
        </Typography>
      )}
      {checkResult && (
        <LevelCheckCard result={checkResult} onDismiss={dismissCheckResult} />
      )}
      <div className={styles.composerActions}>
        <Button variant="outlined" size="small" onClick={onClose} disabled={busy}>
          Close
        </Button>
        {dirty && (
          <Button
            variant="outlined"
            size="small"
            disabled={busy}
            onClick={discard}
          >
            Discard
          </Button>
        )}
        <Button
          variant="contained"
          size="small"
          disabled={busy || !dirty}
          onClick={() => void submit()}
        >
          Save
        </Button>
      </div>
    </>
  );
}

function VisualizationFields({
  levelDraft,
  skin,
  map,
  selectedPaintToolId,
  onSelectPaintTool,
  onFillAll,
  onClose,
  onDirtyChange,
}: {
  levelDraft: UseLevelDraftResult;
  skin?: string;
  map?: string;
  selectedPaintToolId?: string;
  onSelectPaintTool: (id: string | undefined) => void;
  onFillAll: (toolId: string) => void;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const {
    dirty,
    currentStartDirection,
    setStartDirection,
    paintTools,
    goalFields,
    effectiveNectarGoal,
    effectiveHoneyGoal,
    effectiveMinCollected,
    effectiveFlowerType,
    setNectarGoal,
    setHoneyGoal,
    setMinCollected,
    setFlowerType,
  } = levelDraft;

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const gridSize = (() => {
    if (!map) {
      return undefined;
    }
    try {
      const grid = JSON.parse(map) as unknown[][];
      return Array.isArray(grid) && grid.length
        ? `${grid.length} × ${grid[0]?.length ?? 0}`
        : undefined;
    } catch {
      return undefined;
    }
  })();

  return (
    <div className={styles.propertiesPanelForm}>
      <label htmlFor="panel-start-direction">Start direction</label>
      <select
        id="panel-start-direction"
        value={currentStartDirection}
        onChange={e => setStartDirection(e.target.value)}
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
          <div className={styles.paintPaletteTools}>
            <Button
              type="button"
              size="small"
              variant="outlined"
              onClick={() => onFillAll('wall')}
            >
              Fill all walls
            </Button>
            <Button
              type="button"
              size="small"
              variant="outlined"
              onClick={() => onFillAll('open')}
            >
              Fill all open
            </Button>
          </div>
        </div>
      )}

      {isBeeSkin(skin ?? '') && (
        <label htmlFor="panel-flower-type">
          Flower type
          <select
            id="panel-flower-type"
            value={effectiveFlowerType ?? 'redWithNectar'}
            onChange={e => setFlowerType(e.target.value)}
          >
            {FLOWER_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {goalFields.length > 0 && (
        <div className={styles.paintPalette}>
          <Typography variant="body4" component="span">
            Goals — a level with no finish tile on the grid wins by meeting
            these instead of reaching a spot on the map (Bee's nectar/honey,
            every Karel skin's minimum to collect).
          </Typography>
          {goalFields.map(field => {
            const value =
              field.key === 'nectar_goal'
                ? effectiveNectarGoal
                : field.key === 'honey_goal'
                  ? effectiveHoneyGoal
                  : effectiveMinCollected;
            const onChange =
              field.key === 'nectar_goal'
                ? setNectarGoal
                : field.key === 'honey_goal'
                  ? setHoneyGoal
                  : setMinCollected;
            return (
              <label key={field.key} htmlFor={`panel-goal-${field.key}`}>
                {field.label}
                <input
                  id={`panel-goal-${field.key}`}
                  type="number"
                  min={0}
                  value={value ?? ''}
                  onChange={e => onChange(e.target.value)}
                />
              </label>
            );
          })}
        </div>
      )}

      <Typography variant="body4" component="span">
        {skin ? `Skin: ${skin}` : 'Skin: unknown'}
        {gridSize ? ` · Grid: ${gridSize}` : ''}
      </Typography>

      <DraftSectionFooter levelDraft={levelDraft} onClose={onClose} />
    </div>
  );
}

function ToolboxFields({
  levelDraft,
  onClose,
  onDirtyChange,
}: {
  levelDraft: UseLevelDraftResult;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const {dirty, tray, availableBlocks, addChip, removeChip, moveChip} =
    levelDraft;

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  return (
    <div className={styles.propertiesPanelForm}>
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
              {availableBlocks.map(entry => {
                const blockType = chipBlockType(entry.xml);
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className={styles.toolboxChip}
                      onClick={() => addChip({...entry})}
                      aria-label={`Add ${entry.label} to the student toolbox`}
                      title={blockType}
                    >
                      <span className={styles.toolboxChipLabel}>
                        <span>+ {entry.label}</span>
                        {blockType && (
                          <span className={styles.toolboxChipType}>
                            {blockType}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={styles.toolboxTrayColumn}>
            <Typography variant="body4" component="span">
              In the toolbox
            </Typography>
            <ul className={styles.toolboxChipList}>
              {tray.map((entry, index) => {
                const blockType = chipBlockType(entry.xml);
                return (
                  <li key={`${entry.id}-${index}`}>
                    <span className={styles.toolboxChip}>
                      <span className={styles.toolboxChipLabel}>
                        <span>{entry.label}</span>
                        {blockType && (
                          <span className={styles.toolboxChipType}>
                            {blockType}
                          </span>
                        )}
                      </span>
                      <span className={styles.toolboxChipActions}>
                        <button
                          type="button"
                          aria-label={`Move ${entry.label} up in the student toolbox`}
                          disabled={index === 0}
                          onClick={() => moveChip(index, 'up')}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${entry.label} down in the student toolbox`}
                          disabled={index === tray.length - 1}
                          onClick={() => moveChip(index, 'down')}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${entry.label} from the student toolbox`}
                          onClick={() => removeChip(entry.id)}
                        >
                          ×
                        </button>
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <DraftSectionFooter levelDraft={levelDraft} onClose={onClose} />
    </div>
  );
}

export function WorkspaceFields({
  levelDraft,
  workspaceMode,
  solutionOffer,
  onDismissSolutionOffer,
  onClose,
  onDirtyChange,
}: {
  levelDraft: UseLevelDraftResult;
  workspaceMode: WorkspaceMode | undefined;
  solutionOffer?: {solutionBlocksXml: string; blocksUsed: number};
  onDismissSolutionOffer: () => void;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const {
    dirty,
    switchWorkspaceMode,
    clearWorkspace,
    blockPalette,
    tray,
    addBlockToWorkspace,
    effectiveSolutionXml,
    effectiveIdeal,
    effectiveVerified,
    acceptSolutionOffer,
  } = levelDraft;

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  // Default to the level's CURRENT toolbox composition — a block built
  // here that the student toolbox doesn't offer makes solutionBlocksXml
  // unbuildable by a student, and fails checkImportedMazeLevel's own
  // palette check (missing = solution block types the toolbox doesn't
  // offer). "Show all blocks" is an explicit author opt-in for the rarer
  // case (e.g. authoring a start_blocks scaffold pinned outside the
  // toolbox) — never the default.
  const [showAllBlocks, setShowAllBlocks] = useState(false);
  const toolboxBlockIds = new Set(tray.map(entry => entry.id));
  const visiblePalette = showAllBlocks
    ? blockPalette
    : blockPalette.filter(entry => toolboxBlockIds.has(entry.id));

  return (
    <div className={styles.propertiesPanelForm}>
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
          <Button
            type="button"
            size="small"
            variant="outlined"
            disabled={!workspaceMode}
            onClick={clearWorkspace}
          >
            Clear workspace
          </Button>
        </div>
      </div>

      {workspaceMode && (
        <div className={styles.toolboxTray}>
          <Typography variant="body4" component="span">
            Click a block to add it to the canvas — no drag required.
          </Typography>
          <label htmlFor="panel-show-all-blocks">
            <input
              id="panel-show-all-blocks"
              type="checkbox"
              checked={showAllBlocks}
              onChange={e => setShowAllBlocks(e.target.checked)}
            />
            Show all blocks (not just this level&apos;s toolbox)
          </label>
          <ul className={styles.toolboxChipList}>
            {visiblePalette.map(entry => (
              <li key={entry.id}>
                <button
                  type="button"
                  className={styles.toolboxChip}
                  onClick={() => addBlockToWorkspace(entry)}
                  aria-label={`Add ${entry.label} to the workspace`}
                >
                  + {entry.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Typography variant="body4" component="span">
        {effectiveSolutionXml
          ? effectiveVerified
            ? `Solution: verified by author run (${effectiveIdeal ?? '?'} blocks)`
            : 'Solution: saved, not verified since the last change'
          : 'No verified solution'}
      </Typography>

      {workspaceMode === 'mySolution' && (
        <Typography variant="body4" component="span">
          Editing here is a scratch attempt — it is not saved. Run it; a
          passing run offers to save it as the solution below. Save saves
          any other pending edits (visualization, toolbox, student start),
          never an unverified &quot;My solution&quot; attempt.
        </Typography>
      )}

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

      <DraftSectionFooter levelDraft={levelDraft} onClose={onClose} />
    </div>
  );
}

/**
 * Panel for a generic-runtime level (multi/match/video/bubbleChoice/
 * levelGroup, plus content-shaped `markdown` data) — reachability is the
 * point of this pass (author-mode-authoring-tools-map.md §4), so the only
 * live field is the title (`updateContent`, already writes any experience's
 * title). Everything else in `data` is real, imported content — shown as an
 * honest read-only count rather than hidden, so an author can at least see
 * what's there before Tier 2 wires the rest through `updateGenericLevelData`.
 */
function GenericFields({
  experience,
  onClose,
  onDirtyChange,
}: {
  experience: ExistingLevelExperience;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [title, setTitle] = useState(experience.title ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = title !== (experience.title ?? '');

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const submit = async () => {
    if (busy || !dirty) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authoringApi.applyChange({
        op: 'updateContent',
        experienceId: experience.id,
        patch: {title},
      });
      onClose();
    } catch {
      setError('That change failed to apply.');
    } finally {
      setBusy(false);
    }
  };

  const notYetEditable = notYetEditableFields(experience.data);

  return (
    <form
      className={styles.propertiesPanelForm}
      onSubmit={e => {
        e.preventDefault();
        void submit();
      }}
    >
      <label htmlFor="panel-generic-title">
        Title
        <input
          id="panel-generic-title"
          type="text"
          value={title}
          disabled={busy}
          onChange={e => setTitle(e.target.value)}
        />
      </label>
      <Typography variant="body4" component="span">
        Type: {experienceTypeLabel(experience)}
      </Typography>
      {notYetEditable.length > 0 && (
        <div className={styles.paintPalette}>
          <Typography variant="body4" component="span">
            Not yet editable here — shown so you can see what's authored:
          </Typography>
          <ul>
            {notYetEditable.map(field => (
              <li key={field}>
                <Typography variant="body4">{field}</Typography>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && (
        <Typography variant="body4" role="status" className={styles.inlineError}>
          {error}
        </Typography>
      )}
      <div className={styles.composerActions}>
        <Button variant="outlined" size="small" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
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

function notYetEditableFields(data: GenericLevelData | undefined): string[] {
  if (!data) {
    return [];
  }
  switch (data.type) {
    case 'multi':
      return [
        'Question',
        `Answers (${data.answers.length})`,
        'Allow multiple attempts',
      ];
    case 'match':
      return [`Pairs (${data.pairs.length})`];
    case 'video':
      return ['Video', 'Caption'];
    case 'bubbleChoice':
      return [`Choices (${data.choices.length})`];
    case 'levelGroup':
      return [`Pages (${data.pages.length})`];
    case 'markdown':
      // Editable via the pencil icon above the stage (updateContent already
      // writes data.markdown) — nothing else on this variant to flag.
      return [];
    case 'opaque':
      return [];
  }
}

/** Panel for a widget experience — title + description, the only fields
 * `updateWidgetMetadata` writes today (author-mode-authoring-tools-map.md
 * §5.1); everything else about a widget is chat-only or read-only. */
function WidgetFields({
  experience,
  onClose,
  onDirtyChange,
}: {
  experience: WidgetExperience;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const {data, isLoading} = useWidget(experience.widgetId);

  if (isLoading || !data?.descriptor) {
    return <Typography variant="body4">Loading…</Typography>;
  }

  return (
    <>
      <WidgetMetadataForm
        widgetId={experience.widgetId}
        descriptor={data.descriptor}
        onClose={onClose}
        onDirtyChange={onDirtyChange}
      />
      <CatalogProvenanceNote
        servedFrom={data.servedFrom}
        catalogFallback={data.catalogFallback}
        catalogRef={data.catalogRef}
      />
      <div className={styles.propertiesPanelForm}>
        <ProposeWidgetButton widgetId={experience.widgetId} />
      </div>
    </>
  );
}

/** Surfaces GET /api/widgets/:id's servedFrom/catalogRef/catalogFallback
 * fields (widget-pr-flow plan Pass 6) — the point of carrying them at all
 * is so an author can tell "this is the reviewed catalog build" from "the
 * catalog reference exists but couldn't be resolved, so you're looking at
 * the draft" apart from a silent, identical-looking fallback. */
function CatalogProvenanceNote({
  servedFrom,
  catalogFallback,
  catalogRef,
}: {
  servedFrom?: 'catalog' | 'session';
  catalogFallback?: boolean;
  catalogRef?: {slug: string; version: string};
}) {
  if (servedFrom === 'catalog' && catalogRef) {
    return (
      <Typography variant="body4" className={styles.writebackNote}>
        Served from the widgets catalog ({catalogRef.slug} v
        {catalogRef.version}).
      </Typography>
    );
  }
  if (catalogFallback && catalogRef) {
    return (
      <Typography
        variant="body4"
        role="status"
        className={styles.inlineError}
      >
        This widget adopted {catalogRef.slug} v{catalogRef.version}, but the
        catalog build couldn&apos;t be resolved — serving the session draft
        instead.
      </Typography>
    );
  }
  return null;
}

function WidgetMetadataForm({
  widgetId,
  descriptor,
  onClose,
  onDirtyChange,
}: {
  widgetId: string;
  descriptor: WidgetDescriptor;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [title, setTitle] = useState(descriptor.title);
  const [description, setDescription] = useState(descriptor.description);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty =
    title !== descriptor.title || description !== descriptor.description;

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const submit = async () => {
    if (busy || !dirty) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authoringApi.applyChange({
        op: 'updateWidgetMetadata',
        widgetId,
        patch: {title, description},
      });
      onClose();
    } catch {
      setError('That change failed to apply.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className={styles.propertiesPanelForm}
      onSubmit={e => {
        e.preventDefault();
        void submit();
      }}
    >
      <label htmlFor="panel-widget-title">
        Title
        <input
          id="panel-widget-title"
          type="text"
          value={title}
          disabled={busy}
          onChange={e => setTitle(e.target.value)}
        />
      </label>
      <label htmlFor="panel-widget-description">
        Description (what the model is told this widget does)
        <textarea
          id="panel-widget-description"
          value={description}
          disabled={busy}
          onChange={e => setDescription(e.target.value)}
        />
      </label>
      {error && (
        <Typography variant="body4" role="status" className={styles.inlineError}>
          {error}
        </Typography>
      )}
      <div className={styles.composerActions}>
        <Button variant="outlined" size="small" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
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

import {Button, IconButton, Typography} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';

import type {ExistingLevelExperience} from '@code-dot-org/authoring';
import {useEscapeKeyHandler} from '@code-dot-org/component-library/common/hooks';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {authoringApi, useLevelProperties} from '@/modules/authoring';

import type {UseLevelDraftResult} from '../levelDraft';
import type {WorkspaceMode} from '../workspaceMode';

import {LevelCheckCard, type PanelSection} from './ExperienceStage';

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

interface PropertiesPanelProps {
  experience: ExistingLevelExperience;
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
  workspaceMode,
  solutionOffer,
  onDismissSolutionOffer,
}: PropertiesPanelProps) {
  const levelNumericId = experience.levelNumericId;
  const {data: properties} = useLevelProperties(levelNumericId ?? -1);
  const levelProps =
    levelNumericId !== undefined
      ? properties?.[String(levelNumericId)]
      : undefined;
  const appName = levelProps?.appName as string | undefined;

  useEscapeKeyHandler(onClose);

  return (
    <div className={styles.propertiesPanel}>
      <div className={styles.propertiesPanelHeader}>
        <Typography variant="h6" component="h2">
          {sectionTitle(section)}
        </Typography>
        <IconButton size="small" aria-label="Close panel" onClick={onClose}>
          <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
        </IconButton>
      </div>
      {levelNumericId === undefined ? (
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

function sectionTitle(section: PanelSection): string {
  switch (section) {
    case 'instructions':
      return 'Instructions';
    case 'visualization':
      return 'Visualization';
    case 'toolbox':
      return 'Toolbox';
    case 'workspace':
      return 'Workspace';
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
  onClose,
  onDirtyChange,
}: {
  levelDraft: UseLevelDraftResult;
  skin?: string;
  map?: string;
  selectedPaintToolId?: string;
  onSelectPaintTool: (id: string | undefined) => void;
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
    setNectarGoal,
    setHoneyGoal,
    setMinCollected,
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
        </div>
      )}

      {goalFields.length > 0 && (
        <div className={styles.paintPalette}>
          <Typography variant="body4" component="span">
            Goals — not enforced by this prototype's engine (win still checks
            the finish tile); used only to keep the map's item counts
            consistent with what the level claims to require.
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
  const {dirty, tray, availableBlocks, addChip, removeChip} = levelDraft;

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

      <DraftSectionFooter levelDraft={levelDraft} onClose={onClose} />
    </div>
  );
}

function WorkspaceFields({
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
    addBlockToWorkspace,
    effectiveSolutionXml,
    effectiveIdeal,
    effectiveVerified,
    acceptSolutionOffer,
  } = levelDraft;

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

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
          <ul className={styles.toolboxChipList}>
            {blockPalette.map(entry => (
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

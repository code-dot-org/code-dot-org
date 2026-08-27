import {Button, IconButton, Typography} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';

import type {ExistingLevelExperience} from '@code-dot-org/authoring';
import {useEscapeKeyHandler} from '@code-dot-org/component-library/common/hooks';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {getPaintTools} from '@code-dot-org/maze-lab';

import {authoringApi, useLevelProperties} from '@/modules/authoring';
import type {LevelCheckResponse} from '@/modules/authoring';

import {LevelCheckCard, type PanelSection} from './ExperienceStage';

import styles from './authoring.module.scss';

// Same reasoning as the field that used to live in LevelInstructions.tsx:
// shortInstructions is a CSF/Blockly-era field lab2 labs never read, and
// music-lab only displays longInstructions.
const SHORT_INSTRUCTIONS_RELEVANT_BY_APP_NAME: Record<string, boolean> = {
  music: false,
};

// Mirrors packages/labs/maze/src/tiles.ts's Direction enum (0=north,
// 1=east, 2=south, 3=west) — kept as a standalone copy here for the same
// reason ExperienceStage's RESULT_SUCCESS is: porting a lab-internal
// constant wholesale is out of scope for the host.
const START_DIRECTION_OPTIONS = [
  {value: '0', label: 'North'},
  {value: '1', label: 'East'},
  {value: '2', label: 'South'},
  {value: '3', label: 'West'},
] as const;

interface PropertiesPanelProps {
  section: PanelSection;
  experience: ExistingLevelExperience;
  onClose: () => void;
  /** Reports whether the panel has an unsaved edit — LessonPlayer refuses to
   * switch the panel to a different section while this is true, so an
   * in-progress edit is never discarded by a stray click elsewhere. */
  onDirtyChange: (dirty: boolean) => void;
  /** Map-painting selection — lives in LessonPlayer (see its state
   * comment); the 'level' section's palette reads/sets it. */
  selectedPaintToolId?: string;
  onSelectPaintTool: (id: string | undefined) => void;
  /** The freshly painted wire-format patch, whenever the stage overlay
   * reports one — folded into this panel's own Save draft. */
  mapDraftPatch?: {serialized_maze: string; maze: string};
}

/**
 * Right-side properties panel — the one editing surface for the lesson
 * stage's click-to-edit sections (see docs/prototypes/
 * author-mode-properties-panel.md §5). Pass A's slice: two sections,
 * `instructions` (any existingLevel, reusing the pencil-affordance's former
 * form logic) and `level` (maze-family only, proving `overrideLevelDefinition`
 * with a single field). Both read the same `useLevelProperties(levelNumericId)`
 * cache LabHostStage already populates — no new fetch, no new cache key.
 */
export default function PropertiesPanel({
  section,
  experience,
  onClose,
  onDirtyChange,
  selectedPaintToolId,
  onSelectPaintTool,
  mapDraftPatch,
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
          {section === 'instructions' ? 'Instructions' : 'Level'}
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
      ) : (
        <LevelFields
          experienceId={experience.id}
          levelNumericId={levelNumericId}
          skin={levelProps?.skin as string | undefined}
          startDirection={levelProps?.startDirection as string | undefined}
          onClose={onClose}
          onDirtyChange={onDirtyChange}
          selectedPaintToolId={selectedPaintToolId}
          onSelectPaintTool={onSelectPaintTool}
          mapDraftPatch={mapDraftPatch}
        />
      )}
    </div>
  );
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

/** Accumulated edits for the 'level' section — startDirection (Pass A) and
 * the map fields (Pass B). Every key optional: Save only ever sends what
 * the author actually touched. */
interface LevelDraftPatch {
  startDirection?: string;
  serialized_maze?: string;
  maze?: string;
}

function LevelFields({
  experienceId,
  levelNumericId,
  skin,
  startDirection,
  onClose,
  onDirtyChange,
  selectedPaintToolId,
  onSelectPaintTool,
  mapDraftPatch,
}: {
  experienceId: string;
  levelNumericId: number;
  skin?: string;
  startDirection?: string;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
  selectedPaintToolId?: string;
  onSelectPaintTool: (id: string | undefined) => void;
  mapDraftPatch?: {serialized_maze: string; maze: string};
}) {
  const queryClient = useQueryClient();
  // {} = no pending edit; each field falls back to the served value.
  const [draft, setDraft] = useState<LevelDraftPatch>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<LevelCheckResponse | null>(
    null,
  );
  const currentValue = draft.startDirection ?? startDirection ?? '1';
  const dirty = Object.keys(draft).length > 0;
  const paintTools = skin ? getPaintTools(skin) : [];
  const showMapPainter = paintTools.length > 0;

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
        experienceId,
        patch: draft,
      });
      await queryClient.invalidateQueries({
        queryKey: ['authoring', 'levelProperties', levelNumericId],
      });
      setDraft({});
      // A painted map that breaks solvability should tell the author
      // immediately, not silently — but a failed check is still a
      // successful Save (§1.10: Save is never gated on verification), so
      // this runs after the invalidate/reset above regardless of outcome.
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

  return (
    <form
      className={styles.propertiesPanelForm}
      onSubmit={e => {
        e.preventDefault();
        void submit();
      }}
    >
      <label htmlFor="properties-panel-start-direction">Start direction</label>
      <select
        id="properties-panel-start-direction"
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
      {showMapPainter && (
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

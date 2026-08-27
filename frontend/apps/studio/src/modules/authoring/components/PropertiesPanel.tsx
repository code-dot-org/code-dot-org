import {Button, IconButton, Typography} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';

import type {ExistingLevelExperience} from '@code-dot-org/authoring';
import {useEscapeKeyHandler} from '@code-dot-org/component-library/common/hooks';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {authoringApi, useLevelProperties} from '@/modules/authoring';

import type {PanelSection} from './ExperienceStage';

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
  /** Reports whether the panel has an unsaved edit — LessonPlayer's hover
   * state machine pins the panel open (never swaps or closes it on hover)
   * while this is true, the same way a click-pin does. */
  onDirtyChange: (dirty: boolean) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

/**
 * Right-side properties panel — the one editing surface for the lesson
 * stage's hover-to-preview sections (see docs/prototypes/
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
  onPointerEnter,
  onPointerLeave,
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
    <div
      className={styles.propertiesPanel}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
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
          startDirection={levelProps?.startDirection as string | undefined}
          onClose={onClose}
          onDirtyChange={onDirtyChange}
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

function LevelFields({
  experienceId,
  levelNumericId,
  startDirection,
  onClose,
  onDirtyChange,
}: {
  experienceId: string;
  levelNumericId: number;
  startDirection?: string;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const queryClient = useQueryClient();
  // undefined = no pending edit; the select shows the served value.
  const [draft, setDraft] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentValue = draft ?? startDirection ?? '1';

  useEffect(() => {
    onDirtyChange(draft !== undefined);
  }, [draft, onDirtyChange]);

  const submit = async () => {
    if (busy || draft === undefined) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authoringApi.applyChange({
        op: 'overrideLevelDefinition',
        experienceId,
        patch: {startDirection: draft},
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
      <label htmlFor="properties-panel-start-direction">Start direction</label>
      <select
        id="properties-panel-start-direction"
        value={currentValue}
        onChange={e => setDraft(e.target.value)}
      >
        {START_DIRECTION_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
          disabled={busy || draft === undefined}
        >
          Save
        </Button>
      </div>
    </form>
  );
}

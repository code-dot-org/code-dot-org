import {Button, IconButton, Typography} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';

import type {ExistingLevelExperience} from '@code-dot-org/authoring';
import {useEscapeKeyHandler} from '@code-dot-org/component-library/common/hooks';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {authoringApi, useLevelProperties} from '@/modules/authoring';

import styles from './authoring.module.scss';

// Same reasoning as the field that used to live in LevelInstructions.tsx:
// shortInstructions is a CSF/Blockly-era field lab2 labs never read, and
// music-lab only displays longInstructions.
const SHORT_INSTRUCTIONS_RELEVANT_BY_APP_NAME: Record<string, boolean> = {
  music: false,
};

interface PropertiesPanelProps {
  experience: ExistingLevelExperience;
  onClose: () => void;
  /** Reports whether the panel has an unsaved edit — LessonPlayer refuses to
   * switch the panel to a different section while this is true, so an
   * in-progress edit is never discarded by a stray click elsewhere. */
  onDirtyChange: (dirty: boolean) => void;
}

/**
 * Right-side properties panel — the lesson stage's click-to-edit surface
 * for content elements a learner sees (see docs/prototypes/
 * author-mode-properties-panel.md §5). Instructions only: level-wide
 * settings (start direction, map painting, the toolbox tray, student-start
 * editing) moved to the left rail (LevelRail.tsx, product decision 8/27) —
 * level settings are page settings, not a stage click-target.
 */
export default function PropertiesPanel({
  experience,
  onClose,
  onDirtyChange,
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
          Instructions
        </Typography>
        <IconButton size="small" aria-label="Close panel" onClick={onClose}>
          <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
        </IconButton>
      </div>
      {levelNumericId === undefined ? (
        <Typography variant="body4">Nothing to edit here.</Typography>
      ) : (
        <InstructionsFields
          experienceId={experience.id}
          levelNumericId={levelNumericId}
          appName={appName}
          shortInstructions={levelProps?.shortInstructions as string | undefined}
          longInstructions={levelProps?.longInstructions as string | undefined}
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

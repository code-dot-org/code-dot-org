import {Button, IconButton, Typography} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import classNames from 'classnames';
import {useState} from 'react';

import {useEscapeKeyHandler} from '@code-dot-org/component-library/common/hooks';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Markdown} from '@code-dot-org/markdown';

import {authoringApi} from '../api';

import styles from './authoring.module.scss';

// Past this many characters, the block collapses to ~3 lines with an
// "expand" toggle rather than pushing the mounted lab further down the page.
const LONG_TEXT_THRESHOLD = 220;

// shortInstructions is a CSF/Blockly-era field (StudioApp, p5lab) — lab2
// labs never read it. music-lab only displays longInstructions, so editing
// shortInstructions on a music level has no visible effect; hide the field
// there rather than let authors write text nothing shows.
const SHORT_INSTRUCTIONS_RELEVANT_BY_APP_NAME: Record<string, boolean> = {
  music: false,
};

interface LevelInstructionsProps {
  experienceId: string;
  levelNumericId: number;
  appName?: string;
  shortInstructions?: string;
  longInstructions?: string;
  /** The mounted lab (maze-lab or music-lab) already renders these
   * instructions itself whenever they're set — skip the readonly preview
   * here so the author/learner doesn't see the text twice, but keep the
   * edit affordance (the lab has no editing UI of its own). */
  selfDisplayedByLab: boolean;
  authorMode: boolean;
}

/**
 * Learner-facing instructions for an existingLevel experience, plus the
 * author's "Edit instructions" affordance. Mounted above the lab in
 * ExperienceStage — the single host for both audiences, matching that
 * component's "what the author sees is what the learner gets" contract
 * (the edit bar itself is the one piece gated on authorMode).
 */
export default function LevelInstructions({
  experienceId,
  levelNumericId,
  appName,
  shortInstructions,
  longInstructions,
  selfDisplayedByLab,
  authorMode,
}: LevelInstructionsProps) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const showShortInstructionsField =
    SHORT_INSTRUCTIONS_RELEVANT_BY_APP_NAME[appName ?? ''] ?? true;
  const text = longInstructions?.trim()
    ? longInstructions
    : shortInstructions?.trim()
      ? shortInstructions
      : undefined;

  if (!authorMode) {
    if (!text || selfDisplayedByLab) {
      return null;
    }
    return (
      <div className={styles.levelInstructions}>
        <InstructionsBody
          text={text}
          expanded={expanded}
          onToggle={() => setExpanded(v => !v)}
        />
      </div>
    );
  }

  if (editing) {
    return (
      <div className={styles.levelInstructions}>
        <LevelInstructionsEditor
          initialShortInstructions={shortInstructions ?? ''}
          initialLongInstructions={longInstructions ?? ''}
          showShortInstructionsField={showShortInstructionsField}
          onCancel={() => setEditing(false)}
          onSubmit={async patch => {
            await authoringApi.applyChange({
              op: 'overrideLevelInstructions',
              experienceId,
              patch,
            });
            await queryClient.invalidateQueries({
              queryKey: ['authoring', 'levelProperties', levelNumericId],
            });
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.levelInstructions}>
      <div className={styles.levelInstructionsEditBar}>
        <IconButton
          size="small"
          aria-label="Edit instructions"
          onClick={() => setEditing(true)}
        >
          <FontAwesomeV6Icon iconName="pen-to-square" iconStyle="solid" />
        </IconButton>
      </div>
      {text && !selfDisplayedByLab ? (
        <InstructionsBody
          text={text}
          expanded={expanded}
          onToggle={() => setExpanded(v => !v)}
        />
      ) : (
        <Typography
          variant="body4"
          className={styles.levelInstructionsNote}
        >
          {selfDisplayedByLab
            ? 'Instructions are shown in the lab below.'
            : 'No instructions yet.'}
        </Typography>
      )}
    </div>
  );
}

function InstructionsBody({
  text,
  expanded,
  onToggle,
}: {
  text: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isLong = text.length > LONG_TEXT_THRESHOLD;
  return (
    <>
      <Markdown
        className={classNames(isLong && !expanded && styles.levelInstructionsCollapsed)}
      >
        {text}
      </Markdown>
      {isLong && (
        <button
          type="button"
          className={styles.levelInstructionsToggle}
          onClick={onToggle}
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  );
}

interface InstructionsFormPatch {
  shortInstructions: string;
  longInstructions: string;
}

function LevelInstructionsEditor({
  initialShortInstructions,
  initialLongInstructions,
  showShortInstructionsField,
  onCancel,
  onSubmit,
}: {
  initialShortInstructions: string;
  initialLongInstructions: string;
  showShortInstructionsField: boolean;
  onCancel: () => void;
  onSubmit: (patch: InstructionsFormPatch) => Promise<void>;
}) {
  const [shortInstructions, setShortInstructions] = useState(
    initialShortInstructions,
  );
  const [longInstructions, setLongInstructions] = useState(
    initialLongInstructions,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEscapeKeyHandler(onCancel);

  const submit = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit({shortInstructions, longInstructions});
    } catch {
      setError('That change failed to apply.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className={styles.contentComposer}
      onSubmit={e => {
        e.preventDefault();
        void submit();
      }}
    >
      {showShortInstructionsField && (
        <textarea
          aria-label="Short instructions"
          placeholder="Short instructions (optional)"
          value={shortInstructions}
          onChange={e => setShortInstructions(e.target.value)}
        />
      )}
      <textarea
        aria-label="Instructions (markdown)"
        placeholder="Instructions shown to the learner…"
        value={longInstructions}
        onChange={e => setLongInstructions(e.target.value)}
      />
      {error && (
        <Typography
          variant="body4"
          role="status"
          className={styles.inlineError}
        >
          {error}
        </Typography>
      )}
      <div className={styles.composerActions}>
        <Button variant="outlined" size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" size="small" disabled={busy}>
          Save
        </Button>
      </div>
    </form>
  );
}

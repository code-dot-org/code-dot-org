import {IconButton, Typography} from '@mui/material';
import classNames from 'classnames';
import {useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Markdown} from '@code-dot-org/markdown';

import styles from './authoring.module.scss';

// Past this many characters, the block collapses to ~3 lines with an
// "expand" toggle rather than pushing the mounted lab further down the page.
const LONG_TEXT_THRESHOLD = 220;

interface LevelInstructionsProps {
  shortInstructions?: string;
  longInstructions?: string;
  /** music-lab already renders these instructions itself whenever they're
   * set — skip the readonly preview here so the learner doesn't see the
   * text twice. (maze-lab does too, but ExperienceStage skips mounting
   * this component at all for maze — see its `hostRendersInstructions` —
   * so this flag is effectively music-only now.) */
  selfDisplayedByLab: boolean;
  authorMode: boolean;
  /** Properties-panel selection state — see ExperienceStage's PanelSection. */
  selected?: boolean;
  /** Opens (pins) the panel on this section. Hover only highlights the card
   * (CSS, discoverability only) — the pencil button is the click target,
   * also the keyboard-reachable equivalent. */
  onClick?: () => void;
}

/**
 * Learner-facing instructions for an existingLevel experience that doesn't
 * self-display them (see `selfDisplayedByLab`) — mounted above the lab in
 * ExperienceStage, the single host for both audiences, matching that
 * component's "what the author sees is what the learner gets" contract.
 * Editing lives in the properties panel (LessonPlayer/PropertiesPanel), not
 * here — this component only renders the readonly preview, plus (in author
 * mode) the hover highlight and click target that open it.
 */
export default function LevelInstructions({
  shortInstructions,
  longInstructions,
  selfDisplayedByLab,
  authorMode,
  selected,
  onClick,
}: LevelInstructionsProps) {
  const [expanded, setExpanded] = useState(false);
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

  return (
    <div
      className={classNames(
        styles.levelInstructions,
        styles.levelInstructionsEditable,
        selected && styles.levelInstructionsSelected,
      )}
    >
      <div className={styles.levelInstructionsEditBar}>
        <IconButton
          size="small"
          aria-label="Select instructions"
          aria-pressed={selected}
          onClick={onClick}
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
        <Typography variant="body4" className={styles.levelInstructionsNote}>
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

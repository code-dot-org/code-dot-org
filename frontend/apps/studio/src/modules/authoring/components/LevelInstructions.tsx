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
  /** The mounted lab (maze-lab or music-lab) already renders these
   * instructions itself whenever they're set — skip the readonly preview
   * here so the author/learner doesn't see the text twice, but keep the
   * hover-to-preview affordance (the properties panel is where it's edited). */
  selfDisplayedByLab: boolean;
  authorMode: boolean;
  /** Properties-panel selection state — see ExperienceStage's PanelSection. */
  selected?: boolean;
  /** Hovering the block previews it in the panel (after LessonPlayer's
   * intent delay); the pencil button pins it open immediately — also the
   * keyboard-reachable equivalent, since hover has none. */
  onHoverEnter?: () => void;
  onHoverLeave?: () => void;
  onClick?: () => void;
}

/**
 * Learner-facing instructions for an existingLevel experience. Mounted above
 * the lab in ExperienceStage — the single host for both audiences, matching
 * that component's "what the author sees is what the learner gets" contract.
 * Editing lives in the properties panel (LessonPlayer/PropertiesPanel), not
 * here — this component only renders the readonly preview, plus (in author
 * mode) the hover/click targets that open it.
 */
export default function LevelInstructions({
  shortInstructions,
  longInstructions,
  selfDisplayedByLab,
  authorMode,
  selected,
  onHoverEnter,
  onHoverLeave,
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
        selected && styles.levelInstructionsSelected,
      )}
      onPointerEnter={onHoverEnter}
      onPointerLeave={onHoverLeave}
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

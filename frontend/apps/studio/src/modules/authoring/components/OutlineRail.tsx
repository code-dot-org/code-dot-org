import {IconButton, Typography} from '@mui/material';
import {useState} from 'react';

import type {Experience} from '@code-dot-org/authoring';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {authoringApi, type CurriculumChangeInput} from '../api';

import InsertPoint from './InsertPoint';

import styles from './authoring.module.scss';

interface OutlineRailProps {
  lessonId: string;
  experiences: Experience[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Author chose "+" at an insertion point: focus the AI on that spot. */
  onAskAiAt: (position: number) => void;
}

const KIND_ICONS: Record<string, string> = {
  content: 'file-lines',
  existingLevel: 'cube',
  widget: 'puzzle-piece',
};

/**
 * Selected-lesson outline with lightweight direct-manipulation affordances:
 * jump, reorder, remove, and insertion points. Structural edits go through the
 * same CurriculumChange log the agent uses — the UI is just another author.
 */
export default function OutlineRail({
  lessonId,
  experiences,
  activeIndex,
  onSelect,
  onAskAiAt,
}: OutlineRailProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = async (changeBody: CurriculumChangeInput) => {
    if (busy) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authoringApi.applyChange(changeBody);
    } catch {
      setError('That change failed to apply.');
    } finally {
      setBusy(false);
    }
  };

  const move = (experienceId: string, toPosition: number) =>
    change({op: 'moveExperience', lessonId, experienceId, toPosition});

  const remove = (experienceId: string) =>
    change({op: 'removeExperience', lessonId, experienceId});

  return (
    <nav className={styles.rail} aria-label="Lesson outline">
      <InsertPoint lessonId={lessonId} position={0} onAskAiAt={onAskAiAt} />
      {experiences.map((experience, index) => (
        <div key={experience.id}>
          {/* The row label is the activating control; action buttons are
              siblings, not nested inside it, so a child button's keydown
              can't bubble up and hijack the row's own Enter/Space handling. */}
          <div
            className={
              index === activeIndex
                ? `${styles.railItem} ${styles.railItemActive}`
                : styles.railItem
            }
          >
            <button
              type="button"
              className={styles.railItemButton}
              onClick={() => onSelect(index)}
            >
              <span className={styles.railItemKind} aria-hidden>
                <FontAwesomeV6Icon
                  iconName={KIND_ICONS[experience.kind] ?? 'circle'}
                  iconStyle="regular"
                />
              </span>
              <span className={styles.railItemLabel}>
                <Typography variant="body2" component="span">
                  {experience.title ?? experience.id}
                </Typography>
              </span>
            </button>
            <span className={styles.railItemActions}>
              <IconButton
                size="small"
                aria-label="Move up"
                disabled={index === 0 || busy}
                onClick={() => void move(experience.id, index - 1)}
              >
                <FontAwesomeV6Icon iconName="arrow-up" iconStyle="solid" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Move down"
                disabled={index === experiences.length - 1 || busy}
                onClick={() => void move(experience.id, index + 1)}
              >
                <FontAwesomeV6Icon iconName="arrow-down" iconStyle="solid" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Remove"
                disabled={busy}
                onClick={() => void remove(experience.id)}
              >
                <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
              </IconButton>
            </span>
          </div>
          <InsertPoint
            lessonId={lessonId}
            position={index + 1}
            onAskAiAt={onAskAiAt}
          />
        </div>
      ))}
      {error && (
        <Typography variant="body4" role="status">
          {error}
        </Typography>
      )}
    </nav>
  );
}

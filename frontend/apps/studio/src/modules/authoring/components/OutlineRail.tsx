import {IconButton, Typography} from '@mui/material';
import {useState} from 'react';

import type {Experience} from '@code-dot-org/authoring';

import {authoringApi} from '../api';

import styles from './authoring.module.scss';

interface OutlineRailProps {
  lessonId: string;
  experiences: Experience[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Author chose "+" at an insertion point: focus the AI on that spot. */
  onAskAiAt: (position: number) => void;
}

const KIND_GLYPHS: Record<string, string> = {
  content: '📄',
  existingLevel: '🧩',
  widget: '✨',
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

  const change = async (changeBody: Record<string, unknown>) => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await authoringApi.applyChange(changeBody);
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
      <InsertPoint position={0} onAskAiAt={onAskAiAt} />
      {experiences.map((experience, index) => (
        <div key={experience.id}>
          <div
            className={
              index === activeIndex
                ? `${styles.railItem} ${styles.railItemActive}`
                : styles.railItem
            }
            role="button"
            tabIndex={0}
            onClick={() => onSelect(index)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(index);
              }
            }}
          >
            <span className={styles.railItemKind} aria-hidden>
              {KIND_GLYPHS[experience.kind] ?? '•'}
            </span>
            <span className={styles.railItemLabel}>
              <Typography variant="body2" component="span">
                {experience.title ?? experience.id}
              </Typography>
            </span>
            <span className={styles.railItemActions}>
              <IconButton
                size="small"
                aria-label="Move up"
                disabled={index === 0 || busy}
                onClick={e => {
                  e.stopPropagation();
                  void move(experience.id, index - 1);
                }}
              >
                ↑
              </IconButton>
              <IconButton
                size="small"
                aria-label="Move down"
                disabled={index === experiences.length - 1 || busy}
                onClick={e => {
                  e.stopPropagation();
                  void move(experience.id, index + 1);
                }}
              >
                ↓
              </IconButton>
              <IconButton
                size="small"
                aria-label="Remove"
                disabled={busy}
                onClick={e => {
                  e.stopPropagation();
                  void remove(experience.id);
                }}
              >
                ✕
              </IconButton>
            </span>
          </div>
          <InsertPoint position={index + 1} onAskAiAt={onAskAiAt} />
        </div>
      ))}
    </nav>
  );
}

function InsertPoint({
  position,
  onAskAiAt,
}: {
  position: number;
  onAskAiAt: (position: number) => void;
}) {
  return (
    <div className={styles.railInsert}>
      <button
        type="button"
        aria-label={`Add an activity at position ${position + 1}`}
        onClick={() => onAskAiAt(position)}
      >
        + add here
      </button>
    </div>
  );
}

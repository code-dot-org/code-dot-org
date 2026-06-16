import React from 'react';

import ReorderableCard from '../../curriculum-generator/components/ReorderableCard';
import {LessonSpec} from '../types';

import sharedStyles from '../../curriculum-generator/curriculum-generator.module.scss';
import moduleStyles from '../unit-generator.module.scss';

interface LessonCardProps {
  spec: LessonSpec;
  index: number;
  total: number;
  disabled: boolean;
  onChange: (reactKey: string, patch: Partial<LessonSpec>) => void;
  onRemove: (reactKey: string) => void;
  onMove: (reactKey: string, direction: 'up' | 'down') => void;
}

const LessonCard: React.FC<LessonCardProps> = ({
  spec,
  index,
  total,
  disabled,
  onChange,
  onRemove,
  onMove,
}) => {
  const isExisting = spec.id !== undefined;
  return (
    <ReorderableCard
      title={
        <h3>
          Lesson {index + 1} — <code>{spec.key || '<key>'}</code>
          {isExisting && (
            <span className={moduleStyles.tagExisting} title="Already in unit">
              existing
            </span>
          )}
          {!isExisting && (
            <span className={moduleStyles.tagNew} title="Will be created">
              new
            </span>
          )}
        </h3>
      }
      canMoveUp={index > 0}
      canMoveDown={index < total - 1}
      onMoveUp={() => onMove(spec.reactKey, 'up')}
      onMoveDown={() => onMove(spec.reactKey, 'down')}
      onRemove={() => onRemove(spec.reactKey)}
      removeAriaLabel="Remove lesson"
      removeTitle={
        isExisting
          ? 'Remove from this unit (the lesson will be destroyed on save)'
          : 'Remove lesson'
      }
      disabled={disabled}
    >
      <div className={sharedStyles.cardBody}>
        <div className={sharedStyles.cardSidebar}>
          <div className={sharedStyles.cardField}>
            <label htmlFor={`name-${spec.reactKey}`}>Name</label>
            <input
              id={`name-${spec.reactKey}`}
              value={spec.name}
              onChange={e => onChange(spec.reactKey, {name: e.target.value})}
              placeholder="e.g. Introduction to HTML"
              disabled={disabled}
            />
          </div>
          <div className={sharedStyles.cardField}>
            <label htmlFor={`key-${spec.reactKey}`}>Key</label>
            <input
              id={`key-${spec.reactKey}`}
              value={spec.key}
              onChange={e => onChange(spec.reactKey, {key: e.target.value})}
              placeholder="e.g. intro-html"
              // The lesson key is part of the unit's stable seed identity;
              // changing it on an existing lesson is out of scope for this
              // page (it would invalidate i18n keys and student progress
              // references). Editing the key on a new lesson is fine.
              disabled={disabled || isExisting}
              readOnly={isExisting}
            />
          </div>
          {isExisting && spec.lessonEditPath && (
            <a
              className={moduleStyles.existingLink}
              href={spec.lessonEditPath}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open lesson editor
            </a>
          )}
        </div>
        <div className={sharedStyles.cardMain}>
          <label htmlFor={`outline-${spec.reactKey}`}>
            Generate prompt
            {spec.createdSeparately && (
              <span className={moduleStyles.createdSeparately}>
                {' '}
                — this lesson was created separately and has no prompt yet. You
                can leave this blank, or write one to enable AI generation
                later.
              </span>
            )}
          </label>
          <textarea
            id={`outline-${spec.reactKey}`}
            value={spec.generateOutline}
            onChange={e =>
              onChange(spec.reactKey, {generateOutline: e.target.value})
            }
            placeholder="Describe what this lesson should teach. The per-lesson /generate page will use this when you go fill in the lesson's content."
            disabled={disabled}
          />
        </div>
      </div>
    </ReorderableCard>
  );
};

export default LessonCard;

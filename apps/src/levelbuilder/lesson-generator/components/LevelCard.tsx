import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import {LabType, LevelSpec} from '../types';

import moduleStyles from '../lesson-generator.module.scss';

interface LevelCardProps {
  spec: LevelSpec;
  index: number;
  total: number;
  previewName: string;
  disabled: boolean;
  labOptions: {value: LabType; label: string}[];
  onChange: (key: string, patch: Partial<LevelSpec>) => void;
  onRemove: (key: string) => void;
  onMove: (key: string, direction: 'up' | 'down') => void;
}

const LevelCard: React.FC<LevelCardProps> = ({
  spec,
  index,
  total,
  previewName,
  disabled,
  labOptions,
  onChange,
  onRemove,
  onMove,
}) => {
  const unsupported = !!spec.unsupportedType;
  return (
    <div
      className={
        unsupported
          ? `${moduleStyles.levelCard} ${moduleStyles.levelCardUnsupported}`
          : moduleStyles.levelCard
      }
    >
      <div className={moduleStyles.levelCardHeader}>
        <h3>
          Level {index + 1} —{' '}
          <code>
            {unsupported && spec.existing
              ? spec.existing.scriptLevel.levels?.[0]?.name || previewName
              : previewName}
          </code>
        </h3>
        <button
          type="button"
          className={moduleStyles.iconButton}
          onClick={() => onMove(spec.key, 'up')}
          disabled={disabled || index === 0}
          aria-label="Move up"
          title="Move up"
        >
          <FontAwesomeV6Icon iconName="arrow-up" />
        </button>
        <button
          type="button"
          className={moduleStyles.iconButton}
          onClick={() => onMove(spec.key, 'down')}
          disabled={disabled || index === total - 1}
          aria-label="Move down"
          title="Move down"
        >
          <FontAwesomeV6Icon iconName="arrow-down" />
        </button>
        <button
          type="button"
          className={moduleStyles.deleteButton}
          onClick={() => onRemove(spec.key)}
          disabled={disabled}
          aria-label="Remove level"
          title={
            unsupported
              ? 'Remove from this lesson (the level itself is preserved)'
              : 'Remove level'
          }
        >
          <FontAwesomeV6Icon iconName="trash" />
        </button>
      </div>
      <div className={moduleStyles.cardBody}>
        <div className={moduleStyles.cardSidebar}>
          <div className={moduleStyles.cardField}>
            <label htmlFor={`id-${spec.key}`}>ID</label>
            <input
              id={`id-${spec.key}`}
              value={spec.id}
              onChange={e => onChange(spec.key, {id: e.target.value})}
              placeholder="e.g. intro-1"
              disabled={disabled || unsupported}
            />
          </div>
          <div className={moduleStyles.cardField}>
            <label htmlFor={`lab-${spec.key}`}>Lab</label>
            {unsupported ? (
              <input
                id={`lab-${spec.key}`}
                value={spec.unsupportedType}
                disabled
              />
            ) : (
              <select
                id={`lab-${spec.key}`}
                value={spec.labType}
                onChange={e =>
                  onChange(spec.key, {labType: e.target.value as LabType})
                }
                disabled={disabled}
              >
                {labOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          {!unsupported && (
            <label className={moduleStyles.skipLabel}>
              <input
                type="checkbox"
                checked={spec.generate}
                onChange={e => onChange(spec.key, {generate: e.target.checked})}
                disabled={disabled}
              />
              Generate
            </label>
          )}
        </div>
        <div className={moduleStyles.cardMain}>
          {unsupported ? (
            <p className={moduleStyles.unsupportedNote}>
              The generator doesn't support this lab type. The level stays in
              the lesson at this position; edit its content from the level edit
              page.
            </p>
          ) : (
            <>
              <label htmlFor={`desc-${spec.key}`}>Description</label>
              <textarea
                id={`desc-${spec.key}`}
                value={spec.description}
                onChange={e =>
                  onChange(spec.key, {description: e.target.value})
                }
                placeholder="What this level should teach or do."
                disabled={disabled}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelCard;

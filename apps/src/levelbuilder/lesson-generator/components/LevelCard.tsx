import React from 'react';

import ReorderableCard from '../../curriculum-generator/components/ReorderableCard';
import {LabType, LevelSpec} from '../types';

import sharedStyles from '../../curriculum-generator/curriculum-generator.module.scss';
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
  const displayName =
    unsupported && spec.existing
      ? spec.existing.scriptLevel.levels?.[0]?.name || previewName
      : previewName;
  return (
    <ReorderableCard
      title={
        <h3>
          Level {index + 1} — <code>{displayName}</code>
        </h3>
      }
      canMoveUp={index > 0}
      canMoveDown={index < total - 1}
      onMoveUp={() => onMove(spec.key, 'up')}
      onMoveDown={() => onMove(spec.key, 'down')}
      onRemove={() => onRemove(spec.key)}
      removeAriaLabel="Remove level"
      removeTitle={
        unsupported
          ? 'Remove from this lesson (the level itself is preserved)'
          : 'Remove level'
      }
      disabled={disabled}
      cardClassName={unsupported ? moduleStyles.cardUnsupported : undefined}
    >
      <div className={sharedStyles.cardBody}>
        <div className={sharedStyles.cardSidebar}>
          <div className={sharedStyles.cardField}>
            <label htmlFor={`id-${spec.key}`}>ID</label>
            <input
              id={`id-${spec.key}`}
              value={spec.id}
              onChange={e => onChange(spec.key, {id: e.target.value})}
              placeholder="e.g. intro-1"
              disabled={disabled || unsupported}
            />
          </div>
          <div className={sharedStyles.cardField}>
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
        <div className={sharedStyles.cardMain}>
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
    </ReorderableCard>
  );
};

export default LevelCard;

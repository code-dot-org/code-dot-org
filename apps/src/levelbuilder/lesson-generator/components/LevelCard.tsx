import React from 'react';

import ReorderableCard from '@cdo/apps/levelbuilder/curriculum-generator/components/ReorderableCard';
import {createUuid} from '@cdo/apps/utils';

import {AICHAT_PRESETS, AichatPresetId} from '../ai/aichat';
import {BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES, LabType, LevelSpec} from '../types';

import SublevelSection from './SublevelSection';

import moduleStyles from '../lesson-generator.module.scss';
import sharedStyles from '@cdo/apps/levelbuilder/curriculum-generator/curriculum-generator.module.scss';

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

const SUBLEVEL_LAB_TYPE_SET = new Set<LabType>(
  BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES
);

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

  const sublevelLabOptions = labOptions.filter(o =>
    SUBLEVEL_LAB_TYPE_SET.has(o.value)
  );

  const sublevels = spec.sublevels ?? [];

  const updateSublevels = (next: LevelSpec[]) => {
    onChange(spec.key, {sublevels: next});
  };

  const addSublevel = () => {
    updateSublevels([
      ...sublevels,
      {
        key: createUuid(),
        id: '',
        labType: BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES[0],
        description: '',
        generate: true,
      },
    ]);
  };

  const patchSublevel = (subKey: string, patch: Partial<LevelSpec>) => {
    updateSublevels(
      sublevels.map(s => (s.key === subKey ? {...s, ...patch} : s))
    );
  };

  const removeSublevel = (subKey: string) => {
    updateSublevels(sublevels.filter(s => s.key !== subKey));
  };

  const moveSublevel = (subKey: string, direction: 'up' | 'down') => {
    const i = sublevels.findIndex(s => s.key === subKey);
    if (i < 0) return;
    const target = direction === 'up' ? i - 1 : i + 1;
    if (target < 0 || target >= sublevels.length) return;
    const next = sublevels.slice();
    [next[i], next[target]] = [next[target], next[i]];
    updateSublevels(next);
  };

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
          {!unsupported && spec.labType === 'weblab2' && (
            <div className={sharedStyles.cardField}>
              <label htmlFor={`template-${spec.key}`}>Template group</label>
              <input
                id={`template-${spec.key}`}
                value={spec.templateGroup ?? ''}
                onChange={e =>
                  onChange(spec.key, {
                    templateGroup: e.target.value,
                  })
                }
                placeholder="e.g. main (optional)"
                disabled={disabled}
              />
            </div>
          )}
          {!unsupported && spec.labType === 'aichat' && (
            <div className={sharedStyles.cardField}>
              <label htmlFor={`preset-${spec.key}`}>Preset</label>
              <select
                id={`preset-${spec.key}`}
                value={spec.aichatPreset ?? 'explore'}
                onChange={e =>
                  onChange(spec.key, {
                    aichatPreset: e.target.value as AichatPresetId,
                  })
                }
                disabled={disabled}
              >
                {Object.values(AICHAT_PRESETS).map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          )}
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
                placeholder={
                  spec.labType === 'bubbleChoice'
                    ? 'What choice is the student making, and what unifies these options?'
                    : 'What this level should teach or do.'
                }
                disabled={disabled}
              />
              {spec.labType === 'bubbleChoice' && (
                <SublevelSection
                  sublevels={sublevels}
                  labOptions={sublevelLabOptions}
                  parentPreviewName={previewName}
                  disabled={disabled}
                  onAdd={addSublevel}
                  onPatch={patchSublevel}
                  onRemove={removeSublevel}
                  onMove={moveSublevel}
                />
              )}
            </>
          )}
        </div>
      </div>
    </ReorderableCard>
  );
};

export default LevelCard;

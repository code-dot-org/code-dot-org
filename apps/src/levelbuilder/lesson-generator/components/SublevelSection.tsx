import React from 'react';

import ReorderableCard from '@cdo/apps/levelbuilder/curriculum-generator/components/ReorderableCard';

import {AICHAT_PRESETS, AichatPresetId} from '../ai/aichat';
import {LabType, LevelSpec} from '../types';

import moduleStyles from '../lesson-generator.module.scss';
import sharedStyles from '@cdo/apps/levelbuilder/curriculum-generator/curriculum-generator.module.scss';

// Nested sublevel list rendered inside a Bubble Choice parent card.
// Reuses ReorderableCard so the sublevels visually match the top-level
// cards; the same cardSidebar/cardMain classes lay them out.
interface SublevelSectionProps {
  sublevels: LevelSpec[];
  labOptions: {value: LabType; label: string}[];
  parentPreviewName: string;
  disabled: boolean;
  onAdd: () => void;
  onPatch: (subKey: string, patch: Partial<LevelSpec>) => void;
  onRemove: (subKey: string) => void;
  onMove: (subKey: string, direction: 'up' | 'down') => void;
}

const SublevelSection: React.FC<SublevelSectionProps> = ({
  sublevels,
  labOptions,
  parentPreviewName,
  disabled,
  onAdd,
  onPatch,
  onRemove,
  onMove,
}) => {
  return (
    <div className={moduleStyles.sublevelSection}>
      <div className={moduleStyles.sublevelHeader}>
        <strong>Sublevels</strong>
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className={moduleStyles.sublevelAddButton}
        >
          + Add sublevel
        </button>
      </div>
      {sublevels.length === 0 ? (
        <p className={moduleStyles.sublevelEmpty}>
          Add sublevels here. Each becomes a bubble on the parent's picker page
          and is generated separately.
        </p>
      ) : (
        <ol className={moduleStyles.sublevelList}>
          {sublevels.map((sub, i) => {
            const unsupported = !!sub.unsupportedType;
            const preview = sub.id.trim()
              ? `${parentPreviewName}-${sub.id.trim()}`
              : `${parentPreviewName}-${i + 1}`;
            return (
              <li key={sub.key}>
                <ReorderableCard
                  title={
                    <h4>
                      Sublevel {i + 1} — <code>{preview}</code>
                    </h4>
                  }
                  canMoveUp={i > 0}
                  canMoveDown={i < sublevels.length - 1}
                  onMoveUp={() => onMove(sub.key, 'up')}
                  onMoveDown={() => onMove(sub.key, 'down')}
                  onRemove={() => onRemove(sub.key)}
                  removeAriaLabel="Remove sublevel"
                  removeTitle={
                    unsupported
                      ? 'Remove from this bubble choice (the level itself is preserved)'
                      : 'Remove sublevel'
                  }
                  disabled={disabled}
                  cardClassName={
                    unsupported ? moduleStyles.cardUnsupported : undefined
                  }
                >
                  <div className={sharedStyles.cardBody}>
                    <div className={sharedStyles.cardSidebar}>
                      <div className={sharedStyles.cardField}>
                        <label htmlFor={`subid-${sub.key}`}>ID</label>
                        <input
                          id={`subid-${sub.key}`}
                          value={sub.id}
                          onChange={e => onPatch(sub.key, {id: e.target.value})}
                          placeholder="e.g. art"
                          disabled={disabled || unsupported}
                        />
                      </div>
                      <div className={sharedStyles.cardField}>
                        <label htmlFor={`sublab-${sub.key}`}>Lab</label>
                        {unsupported ? (
                          <input
                            id={`sublab-${sub.key}`}
                            value={sub.unsupportedType}
                            disabled
                          />
                        ) : (
                          <select
                            id={`sublab-${sub.key}`}
                            value={sub.labType}
                            onChange={e =>
                              onPatch(sub.key, {
                                labType: e.target.value as LabType,
                              })
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
                      {!unsupported && sub.labType === 'aichat' && (
                        <div className={sharedStyles.cardField}>
                          <label htmlFor={`subpreset-${sub.key}`}>Preset</label>
                          <select
                            id={`subpreset-${sub.key}`}
                            value={sub.aichatPreset ?? 'explore'}
                            onChange={e =>
                              onPatch(sub.key, {
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
                            checked={sub.generate}
                            onChange={e =>
                              onPatch(sub.key, {generate: e.target.checked})
                            }
                            disabled={disabled}
                          />
                          Generate
                        </label>
                      )}
                    </div>
                    <div className={sharedStyles.cardMain}>
                      {unsupported ? (
                        <p className={moduleStyles.unsupportedNote}>
                          The generator doesn't support this lab type as a
                          sublevel. The sublevel stays in the bubble choice at
                          this position; edit its content from the level edit
                          page.
                        </p>
                      ) : (
                        <>
                          <label htmlFor={`subdesc-${sub.key}`}>
                            Description
                          </label>
                          <textarea
                            id={`subdesc-${sub.key}`}
                            value={sub.description}
                            onChange={e =>
                              onPatch(sub.key, {description: e.target.value})
                            }
                            placeholder="What this sublevel activity teaches or does."
                            disabled={disabled}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </ReorderableCard>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default SublevelSection;

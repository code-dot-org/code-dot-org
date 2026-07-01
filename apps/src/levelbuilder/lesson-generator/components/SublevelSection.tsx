import React from 'react';

import {AICHAT_PRESETS, AichatPresetId} from '../ai/aichat';
import {LabType, LevelSpec} from '../types';

import moduleStyles from '../lesson-generator.module.scss';

// Nested sublevel list rendered inside a Bubble Choice parent card.
// Compact one-line-per-sublevel layout: preview name is subtle, fields
// sit side-by-side, and the description textarea drops below. Visually
// signals "these live inside the parent" without competing with the
// parent card's own chrome.
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
            const preview = sub.id.trim()
              ? `${parentPreviewName}-${sub.id.trim()}`
              : `${parentPreviewName}-${i + 1}`;
            return (
              <li key={sub.key} className={moduleStyles.sublevelRow}>
                <div className={moduleStyles.sublevelTopLine}>
                  <code
                    className={moduleStyles.sublevelPreview}
                    title={preview}
                  >
                    {preview}
                  </code>
                  <div className={moduleStyles.sublevelField}>
                    <label htmlFor={`subid-${sub.key}`}>ID</label>
                    <input
                      id={`subid-${sub.key}`}
                      value={sub.id}
                      onChange={e => onPatch(sub.key, {id: e.target.value})}
                      placeholder="e.g. art"
                      disabled={disabled}
                    />
                  </div>
                  <div className={moduleStyles.sublevelField}>
                    <label htmlFor={`sublab-${sub.key}`}>Lab</label>
                    <select
                      id={`sublab-${sub.key}`}
                      value={sub.labType}
                      onChange={e =>
                        onPatch(sub.key, {labType: e.target.value as LabType})
                      }
                      disabled={disabled}
                    >
                      {labOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {sub.labType === 'aichat' && (
                    <div className={moduleStyles.sublevelField}>
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
                  <label className={moduleStyles.sublevelGenerate}>
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
                  <div className={moduleStyles.sublevelActions}>
                    <button
                      type="button"
                      onClick={() => onMove(sub.key, 'up')}
                      disabled={disabled || i === 0}
                      aria-label="Move sublevel up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => onMove(sub.key, 'down')}
                      disabled={disabled || i === sublevels.length - 1}
                      aria-label="Move sublevel down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(sub.key)}
                      disabled={disabled}
                      aria-label="Remove sublevel"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className={moduleStyles.sublevelDescField}>
                  <label htmlFor={`subdesc-${sub.key}`}>Description</label>
                  <textarea
                    id={`subdesc-${sub.key}`}
                    value={sub.description}
                    onChange={e =>
                      onPatch(sub.key, {description: e.target.value})
                    }
                    placeholder="What this sublevel activity teaches or does."
                    disabled={disabled}
                    rows={2}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default SublevelSection;

import React from 'react';

import i18n from '@cdo/locale';

import styles from './simple-progress.module.scss';

/** A lesson's level as the progress store gives it; only what this reads. */
export interface ProgressLevel {
  headerLabel?: string;
  isCurrentLevel?: boolean;
  bonus?: boolean;
  sublevels?: {isCurrentLevel?: boolean}[];
}

export interface SubPath {
  label: string;
  /** 1-based. A label that covers one level is 1 of 1. */
  position: number;
  total: number;
}

// Where the current level sits among the levels sharing its header label.
// Null when the current level has no label. As the bubbles count: a
// sublevel's parent is current, and bonus levels are left out.
export function subPathFor(levels?: ProgressLevel[]): SubPath | null {
  const counted = levels?.filter(l => !l.bonus);
  const current = counted?.find(
    l => l.isCurrentLevel || l.sublevels?.some(sub => sub.isCurrentLevel)
  );
  if (!counted || !current?.headerLabel) {
    return null;
  }
  const path = counted.filter(l => l.headerLabel === current.headerLabel);
  return {
    label: current.headerLabel,
    position: path.indexOf(current) + 1,
    total: path.length,
  };
}

interface SimpleProgressProps {
  imageUrl?: string;
  levels?: ProgressLevel[];
}

/** A unit's logo, the current level's header label and a bar showing where
    the level sits among those sharing it. Shrinks with the header's row:
    the label ellipsizes and the bar fills what is left. */
const SimpleProgress: React.FunctionComponent<SimpleProgressProps> = ({
  imageUrl,
  levels,
}) => {
  const subPath = subPathFor(levels);
  return (
    <div id="simple_progress" className={styles.outer}>
      <div className={styles.row}>
        {imageUrl && <img src={imageUrl} alt="" className={styles.image} />}
        {subPath && (
          // Keyed on the label so a new part starts at its own fill rather
          // than sliding from the last part's.
          <div key={subPath.label} className={styles.text}>
            <span id="simple_progress_label" className={styles.label}>
              {subPath.label}
            </span>
            <div className={styles.barRow}>
              <div
                className={styles.track}
                role="progressbar"
                aria-labelledby="simple_progress_label"
                aria-valuemin={0}
                aria-valuemax={subPath.total}
                aria-valuenow={subPath.position}
                aria-valuetext={i18n.simpleProgressLevelOf({
                  position: subPath.position,
                  total: subPath.total,
                })}
              >
                <div
                  className={styles.fill}
                  style={{
                    width: `${(100 * subPath.position) / subPath.total}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleProgress;

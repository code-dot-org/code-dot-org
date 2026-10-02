import React from 'react';

import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

const IMAGE_SIZE = 32;

// Lab2 moves between a lesson's levels without a page load, so the bar is
// still mounted when the level changes and can slide to its new fill.
const FILL_TRANSITION = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  .matches
  ? undefined
  : 'width 400ms ease-out';

/** A lesson's level as the progress store gives it; only what this reads. */
export interface ProgressLevel {
  headerLabel?: string;
  isCurrentLevel?: boolean;
  bonus?: boolean;
  sublevels?: {isCurrentLevel?: boolean}[];
}

export interface SubPath {
  label: string;
  /** 1-based; absent, with total, when the label covers one level. */
  position?: number;
  total?: number;
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
  return path.length > 1
    ? {
        label: current.headerLabel,
        position: path.indexOf(current) + 1,
        total: path.length,
      }
    : {label: current.headerLabel};
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
  const label = subPath?.label;
  const progress = subPath?.total ? subPath : null;
  return (
    <div id="simple_progress" style={styles.outer}>
      <div style={styles.row}>
        {imageUrl && <img src={imageUrl} alt="" style={styles.image} />}
        {label && (
          // Keyed on the label so a new part starts at its own fill rather
          // than sliding from the last part's.
          <div key={label} style={styles.text}>
            <span id="simple_progress_label" style={styles.label}>
              {label}
            </span>
            {progress && (
              <div style={styles.barRow}>
                <div
                  style={styles.track}
                  role="progressbar"
                  aria-labelledby="simple_progress_label"
                  aria-valuemin={0}
                  aria-valuemax={progress.total}
                  aria-valuenow={progress.position}
                  aria-valuetext={i18n.simpleProgressLevelOf({
                    position: progress.position,
                    total: progress.total,
                  })}
                >
                  <div
                    style={{
                      ...styles.fill,
                      width: `${(100 * progress.position!) / progress.total!}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleProgress;

const styles: Record<string, React.CSSProperties> = {
  outer: {
    minWidth: 0,
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    height: 50,
    padding: '0 5px',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    boxSizing: 'border-box',
    border: `1px solid ${color.white}`,
    borderRadius: 6,
    backgroundColor: color.black,
    flex: 'none',
    objectFit: 'cover',
  },
  // The unit name on the left is a 16px line over a 14px saved-at line; the
  // label and the bar take the same two lines.
  text: {
    marginInlineStart: 12,
    display: 'flex',
    flexDirection: 'column',
    // Shrinks with the row; the label ellipsizes and the bar fills the column.
    flex: '1 1 auto',
    minWidth: 0,
  },
  label: {
    color: color.white,
    fontSize: 16,
    lineHeight: '24px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  barRow: {
    height: 14,
    display: 'flex',
    alignItems: 'center',
  },
  track: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: color.white,
    transition: FILL_TRANSITION,
  },
};

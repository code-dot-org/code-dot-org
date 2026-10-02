import React, {useEffect, useLayoutEffect, useRef} from 'react';

import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import remeasureOnFontsReady from './remeasureOnFontsReady';

const IMAGE_SIZE = 32;

// Lab2 moves between a lesson's levels without a page load, so the bar is
// still mounted when the level changes and can slide to its new fill.
const FILL_TRANSITION = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  .matches
  ? undefined
  : 'width 400ms ease-out';

/** A lesson's level as the progress store gives it; only what the banner reads. */
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
  /** The slot the header gives it. */
  width?: number;
  setDesiredWidth?: (width: number) => void;
}

/** A unit's logo, the current level's header label and a bar showing where
    the level sits among those sharing it, in the progress bubbles' slot;
    reports its width to the header the way LessonProgress does. */
const SimpleProgress: React.FunctionComponent<SimpleProgressProps> = ({
  imageUrl,
  levels,
  width,
  setDesiredWidth,
}) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // The natural width: what shows plus what the label hides behind its
  // ellipsis, rounded up past the sub-pixel fraction that would ellipsize it.
  const reportWidth = () => {
    const inner = innerRef.current;
    if (!setDesiredWidth || !inner) {
      return;
    }
    const label = labelRef.current;
    const hidden = label ? label.scrollWidth - label.clientWidth : 0;
    const shown = inner.getBoundingClientRect().width;
    setDesiredWidth(Math.ceil(shown + Math.max(0, hidden)) + 1);
  };
  const reportWidthRef = useRef(reportWidth);
  reportWidthRef.current = reportWidth;

  // After every render: the slot and the label both change what shows.
  useLayoutEffect(reportWidth);
  useEffect(() => remeasureOnFontsReady(() => reportWidthRef.current()), []);

  const subPath = subPathFor(levels);
  const label = subPath?.label;
  const progress = subPath?.total ? subPath : null;
  return (
    <div id="simple_progress" style={{width, overflow: 'hidden'}}>
      <div ref={innerRef} style={styles.banner}>
        {imageUrl && <img src={imageUrl} alt="" style={styles.image} />}
        {label && (
          // Keyed on the label so a new part starts at its own fill rather
          // than sliding from the last part's.
          <div key={label} style={styles.text}>
            <span
              id="simple_progress_label"
              ref={labelRef}
              style={styles.label}
            >
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
  // Natural width when the header has room; no wider than the slot when
  // it has not, so the label and bar shrink instead of being cut off.
  banner: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 50,
    padding: '0 5px',
    maxWidth: '100%',
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
    // Shrinks with the slot; the label ellipsizes and the bar fills the column.
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

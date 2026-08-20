// Segmented circular progress: one arc per step, completed arcs lit,
// an optional count in the middle.  One source of truth for skill-path
// progress rendering — the student hub uses it large, the in-path
// header uses it mini, and the teacher view reuses it as-is.

import React from 'react';

import styles from './aiLessons.module.scss';

interface ProgressRingProps {
  done: number;
  total: number;
  // Outer size in px; the ring scales to it.
  size: number;
  strokeWidth?: number;
  // Rendered centered inside the ring (a count, a ✓, a lock).
  center?: React.ReactNode;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad)};
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(
    2
  )} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

const ProgressRing: React.FunctionComponent<ProgressRingProps> = ({
  done,
  total,
  size,
  strokeWidth = Math.max(3, Math.round(size / 14)),
  center,
}) => {
  const c = size / 2;
  const r = (size - strokeWidth) / 2;
  // A small angular gap between segments; a single segment closes the
  // full circle (SVG arcs can't span 360°, so draw two halves).
  const gap = total > 1 ? Math.min(10, 120 / total) : 0;
  const span = total > 0 ? 360 / total : 360;

  const segments = Array.from({length: Math.max(total, 1)}, (_, i) => {
    const start = i * span + gap / 2;
    const end = (i + 1) * span - gap / 2;
    const lit = i < done;
    const cls = lit ? styles.ringSegmentDone : styles.ringSegment;
    if (total <= 1) {
      return (
        <g key={i} className={cls}>
          <path d={arcPath(c, c, r, 0, 180)} strokeWidth={strokeWidth} />
          <path d={arcPath(c, c, r, 180, 360)} strokeWidth={strokeWidth} />
        </g>
      );
    }
    return (
      <path
        key={i}
        className={cls}
        d={arcPath(c, c, r, start, end)}
        strokeWidth={strokeWidth}
      />
    );
  });

  return (
    <span
      className={styles.ring}
      style={{width: size, height: size}}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label={`${done} of ${total} steps complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        {segments}
      </svg>
      {center !== undefined && (
        <span className={styles.ringCenter} aria-hidden="true">
          {center}
        </span>
      )}
    </span>
  );
};

export default ProgressRing;

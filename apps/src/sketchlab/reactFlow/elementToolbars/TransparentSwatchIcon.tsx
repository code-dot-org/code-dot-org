import React from 'react';

// Diagonal slash rendered inside the "Transparent" entry of a color
// palette.
export default function TransparentSwatchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{width: '100%', height: '100%', display: 'block'}}
    >
      <line
        x1="22.5934"
        y1="1.76442"
        x2="1.64605"
        y2="22.2114"
        stroke="var(--text-neutral-quaternary)"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

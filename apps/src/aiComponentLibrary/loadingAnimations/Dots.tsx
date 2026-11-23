import classNames from 'classnames';
import React from 'react';

import moduleStyles from './dots.module.scss';

// The side dots start and end hidden at the middle dot's place.
const DOTS = [
  {cx: 3, offsetToMiddle: '9px', stagger: '0s'},
  {cx: 12, offsetToMiddle: '0px', stagger: '0.15s'},
  {cx: 21, offsetToMiddle: '-9px', stagger: '0.3s'},
];

// Decorative and hidden from screen readers: show it next to role="status"
// text.
export const Dots: React.FunctionComponent<{
  stopping: boolean;
  // Ref to the first dot's circle, for reading how far its bounce has run.
  firstDotRef?: React.Ref<SVGCircleElement>;
  // A number of px, or a length such as '1.5em'. The height is half.
  width?: number | string;
  className?: string;
}> = ({stopping, firstDotRef, width = 32, className}) => (
  <svg
    className={classNames(
      moduleStyles.root,
      stopping ? moduleStyles.stopping : moduleStyles.thinking,
      className
    )}
    width={width}
    viewBox="0 0 24 12"
    fill="none"
    aria-hidden="true"
  >
    {DOTS.map(({cx, offsetToMiddle, stagger}, i) => (
      <g
        key={cx}
        className={moduleStyles.slot}
        style={
          {
            '--offset-to-middle': offsetToMiddle,
            '--stagger': stagger,
          } as React.CSSProperties
        }
      >
        <circle
          ref={i === 0 ? firstDotRef : undefined}
          className={moduleStyles.dot}
          cx={cx}
          cy={9}
          r={3}
          fill="currentColor"
        />
      </g>
    ))}
  </svg>
);

export default Dots;

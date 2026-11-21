import classNames from 'classnames';
import React, {useLayoutEffect, useRef} from 'react';

import moduleStyles from './thinking-dots.module.scss';

// fromX is the offset to the middle dot, where the side dots hide.
const DOTS = [
  {cx: 9.77, fromX: '2.6px', stagger: '0s'},
  {cx: 12.37, fromX: '0px', stagger: '0.15s'},
  {cx: 14.97, fromX: '-2.6px', stagger: '0.3s'},
];

export const ThinkingDots: React.FunctionComponent<{
  phase?: 'thinking' | 'ready';
  size?: number;
  className?: string;
}> = ({phase = 'thinking', size = 48, className}) => {
  const tRef = useRef<SVGPathElement>(null);

  // On 'ready', the T finishes its current hop rather than snapping down
  // from mid-air.
  useLayoutEffect(() => {
    if (phase !== 'ready') {
      return;
    }
    const hop = tRef.current
      ?.getAnimations?.()
      .find(
        a =>
          'animationName' in a &&
          (a as CSSAnimation).animationName === moduleStyles['t-hop']
      );
    if (!hop?.effect) {
      return;
    }
    const {currentIteration} = hop.effect.getComputedTiming();
    if (Number(hop.currentTime) < Number(hop.effect.getTiming().delay)) {
      hop.cancel();
    } else {
      hop.effect.updateTiming({iterations: Number(currentIteration) + 1});
    }
  }, [phase]);

  return (
    <svg
      className={classNames(
        moduleStyles.icon,
        phase === 'ready' ? moduleStyles.ready : moduleStyles.thinking,
        className
      )}
      width={size}
      height={(size * 12) / 17}
      viewBox="0 0 17 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        ref={tRef}
        className={moduleStyles.t}
        d="M0.558594 0C0.250123 0.00017558 2.92907e-09 0.199964 0 0.446289V2.27344C0.000140569 2.51967 0.25021 2.71955 0.558594 2.71973H3.37305V9.6123C3.3733 9.9207 3.62215 10.1707 3.92969 10.1709H6.21191C6.5196 10.1709 6.76928 9.9208 6.76953 9.6123V2.71973H9.61035C9.91892 2.71972 10.1688 2.51977 10.1689 2.27344V0.446289C10.1689 0.199859 9.919 5.98516e-06 9.61035 0H0.558594Z"
        fill="currentColor"
      />
      <path
        className={moduleStyles.sparkle}
        d="M13.8558 3.42765C13.7212 2.76977 12.851 2.53658 12.478 3.05843L11.1415 4.56568L9.1679 4.96952C8.52947 5.03161 8.29631 5.90183 8.79874 6.34737L10.3254 7.61147L10.7293 9.58512C10.7915 10.2236 11.6617 10.4568 12.1072 9.95434L13.3712 8.42766L15.3253 8.09634C15.9832 7.96173 16.2164 7.0915 15.6945 6.71848L14.1872 5.38187L13.8558 3.42765Z"
        fill="currentColor"
      />
      {DOTS.map(({cx, fromX, stagger}) => (
        <g
          key={cx}
          className={moduleStyles.slot}
          style={
            {'--from-x': fromX, '--stagger': stagger} as React.CSSProperties
          }
        >
          <circle
            className={moduleStyles.dot}
            cx={cx}
            cy={9.27}
            r={0.9}
            fill="currentColor"
          />
        </g>
      ))}
    </svg>
  );
};

export default ThinkingDots;

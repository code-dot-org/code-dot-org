import classNames from 'classnames';
import {
  type FunctionComponent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import moduleStyles from './sparkle-pulse.module.scss';

// Must match $quarter-turn in sparkle-pulse.module.scss.
const QUARTER_TURN_MS = 800;
const PULSE_DIMMEST_OPACITY = 0.45;

const hasAnimationName = (animation: Animation, names: string[]) =>
  'animationName' in animation &&
  names.includes((animation as CSSAnimation).animationName);

export const SparklePulse: FunctionComponent<{
  phase?: 'thinking' | 'ready';
  size?: number;
  // Called once the icon comes to rest after 'ready'.
  onStopped?: () => void;
  className?: string;
}> = ({phase = 'thinking', size = 48, onStopped, className}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const fadeRef = useRef<SVGGElement>(null);
  const stopAtRef = useRef<number | null>(null);
  const stopDelayRef = useRef(0);
  const onStoppedRef = useRef(onStopped);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    onStoppedRef.current = onStopped;
  });

  // The stop must begin halfway through a quarter-turn, which is also where
  // the pulse is at full or dimmest.
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (phase !== 'ready' || stopping || !svg) {
      return;
    }
    const pulse = fadeRef.current
      ?.getAnimations?.()
      .find(a => hasAnimationName(a, [moduleStyles['pulse-fade']]));
    let wait = 0;
    let stopFrom = 1;
    if (pulse?.effect) {
      const half = Number(pulse.effect.getComputedTiming().duration) / 2;
      const now = Number(pulse.currentTime);
      const next = Math.max(half, Math.ceil(now / half - 1e-6) * half);
      wait = next - now;
      stopFrom = Math.round(next / half) % 2 === 1 ? PULSE_DIMMEST_OPACITY : 1;
      stopAtRef.current = Number(document.timeline.currentTime) + wait;
    }
    svg.style.setProperty('--pulse-stop-from', String(stopFrom));
    stopDelayRef.current = wait + QUARTER_TURN_MS;
    setStopping(true);
  }, [phase, stopping]);

  useLayoutEffect(() => {
    if (!stopping) {
      return;
    }
    if (stopAtRef.current !== null) {
      const stopNames = [
        moduleStyles['spin-stop'],
        moduleStyles['pulse-fade-stop'],
      ];
      svgRef.current
        ?.getAnimations?.({subtree: true})
        .filter(a => hasAnimationName(a, stopNames))
        .forEach(a => {
          a.startTime = stopAtRef.current;
        });
    }
    const timeoutId = setTimeout(
      () => onStoppedRef.current?.(),
      stopDelayRef.current,
    );
    return () => clearTimeout(timeoutId);
  }, [stopping]);

  return (
    <svg
      ref={svgRef}
      className={classNames(
        moduleStyles.icon,
        stopping ? moduleStyles.stopping : moduleStyles.thinking,
        className,
      )}
      width={size}
      height={(size * 12) / 17}
      viewBox="0 0 17 12"
      fill="none"
      aria-hidden="true"
    >
      <g ref={fadeRef} className={moduleStyles.fade}>
        <path
          d="M0.558594 0C0.250123 0.00017558 2.92907e-09 0.199964 0 0.446289V2.27344C0.000140569 2.51967 0.25021 2.71955 0.558594 2.71973H3.37305V9.6123C3.3733 9.9207 3.62215 10.1707 3.92969 10.1709H6.21191C6.5196 10.1709 6.76928 9.9208 6.76953 9.6123V2.71973H9.61035C9.91892 2.71972 10.1688 2.51977 10.1689 2.27344V0.446289C10.1689 0.199859 9.919 5.98516e-06 9.61035 0H0.558594Z"
          fill="currentColor"
        />
        <g className={moduleStyles.spin}>
          <path
            d="M13.8558 3.42765C13.7212 2.76977 12.851 2.53658 12.478 3.05843L11.1415 4.56568L9.1679 4.96952C8.52947 5.03161 8.29631 5.90183 8.79874 6.34737L10.3254 7.61147L10.7293 9.58512C10.7915 10.2236 11.6617 10.4568 12.1072 9.95434L13.3712 8.42766L15.3253 8.09634C15.9832 7.96173 16.2164 7.0915 15.6945 6.71848L14.1872 5.38187L13.8558 3.42765Z"
            fill="currentColor"
          />
        </g>
      </g>
    </svg>
  );
};

export default SparklePulse;

import {forwardRef} from 'react';
import type {ReactNode} from 'react';

import Button from '@code-dot-org/component-library/button';

import {LOOK_ID, SVG_ID} from '../constants';

export interface VisualizationProps {
  disabled: boolean;
  stepping: boolean;
  running: boolean;
  stepButton: boolean;
  finishButton: boolean;
  onRun: () => void;
  onReset: () => void;
  onStep: () => void;
  onFinish: () => void;
  className?: string;
  /** Rendered in a positioned layer directly over the svg (not the whole
   * component, which also includes the run/reset button row below) — the
   * map painter's HTML grid overlay. `position: relative` lives here, not
   * on the painter, so the painter doesn't need to know this component's
   * layout. */
  overlay?: ReactNode;
}

const Visualization = forwardRef<SVGSVGElement, VisualizationProps>(
  (
    {
      disabled,
      running,
      stepping,
      onRun,
      onReset,
      onStep,
      onFinish,
      className,
      finishButton,
      stepButton,
      overlay,
    },
    ref,
  ) => (
    <div className={className}>
      <div style={{position: 'relative'}}>
        <svg version="1.1" id={SVG_ID} ref={ref}>
          <g id={LOOK_ID}>
            <path d="M 0,-15 a 15 15 0 0 1 15 15" />
            <path d="M 0,-35 a 35 35 0 0 1 35 35" />
            <path d="M 0,-55 a 55 55 0 0 1 55 55" />
          </g>
        </svg>
        {overlay}
      </div>
      <div
        style={{
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'row',
          gap: '0.5rem',
          justifyContent: 'space-between',
        }}
      >
        {!running && !stepping && (
          <Button
            text="Run"
            disabled={disabled}
            onClick={onRun}
            iconLeft={{
              iconName: 'play',
              iconStyle: 'solid',
            }}
          />
        )}
        {(running || stepping) && (
          <Button
            text="Reset"
            disabled={disabled}
            onClick={onReset}
            iconLeft={{
              iconName: 'rotate-right',
              iconStyle: 'solid',
            }}
          />
        )}
        {!!finishButton && (
          <Button
            text="Finish"
            disabled={disabled}
            type="secondary"
            color="black"
            onClick={onFinish}
          />
        )}
        {stepButton !== false && (
          <Button
            text="Step"
            type="secondary"
            color="black"
            disabled={running || disabled}
            onClick={onStep}
          />
        )}
      </div>
    </div>
  ),
);

export default Visualization;

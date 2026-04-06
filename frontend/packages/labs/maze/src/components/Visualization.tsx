import {forwardRef} from 'react';

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
    },
    ref,
  ) => (
    <div className={className}>
      <svg version="1.1" id={SVG_ID} ref={ref}>
        <g id={LOOK_ID}>
          <path d="M 0,-15 a 15 15 0 0 1 15 15" />
          <path d="M 0,-35 a 35 35 0 0 1 35 35" />
          <path d="M 0,-55 a 55 55 0 0 1 55 55" />
        </g>
      </svg>
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

import {forwardRef} from 'react';

import Button from '@code-dot-org/component-library/button';

import moduleStyles from './visualization.module.scss';

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

const Visualization = forwardRef<HTMLDivElement, VisualizationProps>(
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
      <div ref={ref} className={moduleStyles.container} />
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

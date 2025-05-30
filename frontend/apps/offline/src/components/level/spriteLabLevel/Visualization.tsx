import classnames from 'classnames';
import {forwardRef} from 'react';

import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';

import moduleStyles from './spriteLabLevel.module.scss';

const spinnerIcon: FontAwesomeV6IconProps = {
  iconName: 'spinner',
  iconStyle: 'solid',
  animationType: 'spin',
};

export interface VisualizationProps {
  stepping: boolean;
  running: boolean;
  stepButton?: boolean;
  pauseButton?: boolean;
  finishButton: boolean;
  onRun: () => void;
  onReset: () => void;
  onStep?: () => void;
  onPause?: () => void;
  onFinish: () => void;
  className?: string;
}

const Visualization = forwardRef<HTMLDivElement, VisualizationProps>(
  (
    {
      running,
      stepping,
      onRun,
      onReset,
      onStep,
      onPause,
      onFinish,
      className,
      finishButton,
      stepButton,
      pauseButton,
    },
    ref,
  ) => (
    <div className={classnames(moduleStyles.visualization, className)}>
      <div className={moduleStyles.container} ref={ref}>
        <div className={moduleStyles.spinner}>
          <FontAwesomeV6Icon {...spinnerIcon} style={{fontSize: '3rem'}} />
        </div>
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
            onClick={onRun}
            iconLeft={{
              iconName: 'play',
              iconStyle: 'solid',
            }}
          />
        )}
        {!!(running || stepping) && (
          <Button
            text="Reset"
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
            type="secondary"
            color="black"
            onClick={onFinish}
          />
        )}
        {!!stepButton && (
          <Button
            text="Step"
            type="secondary"
            color="black"
            disabled={running}
            onClick={onStep || (() => {})}
          />
        )}
        {!!pauseButton && (
          <Button
            text="Pause"
            type="secondary"
            color="black"
            iconLeft={{
              iconName: 'pause',
              iconStyle: 'solid',
            }}
            disabled={!running}
            onClick={onPause || (() => {})}
          />
        )}
      </div>
    </div>
  ),
);

export default Visualization;

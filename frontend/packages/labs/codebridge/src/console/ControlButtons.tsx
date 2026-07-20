import {Button} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {WithConditionalTooltip} from '../components';
import {useCodebridgeRuntime} from '../contexts';
import {useAppSelector} from '../redux/store';

import styles from './console.module.css';

/**
 * Run / Stop control for the console. Reflects the base `labSystem` lifecycle
 * flags (which the lab's runtime toggles) and invokes the runtime callbacks.
 * Ported and trimmed from apps/src/codebridge/Console/ControlButtons.tsx —
 * predict-level gating, validation, metrics, and start-mode handling are
 * deferred, so the only run-disabling condition is the environment still
 * loading.
 */
const ControlButtons = () => {
  const {onRun, onStop} = useCodebridgeRuntime();
  const isRunning = useAppSelector(state => state.labSystem.isRunning);
  const hasLoadedEnvironment = useAppSelector(
    state => state.labSystem.loadedCodeEnvironment,
  );

  if (isRunning) {
    return (
      <Button
        variant="contained"
        color="error"
        size="extraSmall"
        className={styles.controlButton}
        startIcon={<FontAwesomeV6Icon iconName="square" iconStyle="solid" />}
        onClick={() => onStop?.()}
        disabled={!onStop}
      >
        Stop
      </Button>
    );
  }

  // Disable Run while the code environment is loading, matching legacy: a
  // spinner sits beside the button and a tooltip explains the wait.
  const disabledTooltip = !hasLoadedEnvironment
    ? 'Your environment is loading. Please wait.'
    : null;

  return (
    <WithConditionalTooltip
      showTooltip={!!disabledTooltip}
      tooltipProps={{
        direction: 'onRight',
        text: disabledTooltip || '',
        size: 's',
        tooltipId: 'code-actions-tooltip',
      }}
      icon={
        <FontAwesomeV6Icon
          className={styles.disabledInfoIcon}
          iconName="spinner"
          iconStyle="solid"
          animationType="spin"
          aria-describedby="code-actions-tooltip"
        />
      }
    >
      <Button
        variant="contained"
        color="primary"
        size="extraSmall"
        className={styles.controlButton}
        startIcon={<FontAwesomeV6Icon iconName="play" iconStyle="solid" />}
        onClick={() => onRun?.()}
        disabled={!onRun || !!disabledTooltip}
      >
        Run
      </Button>
    </WithConditionalTooltip>
  );
};

export default ControlButtons;

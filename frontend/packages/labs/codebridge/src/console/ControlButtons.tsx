import {Button} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {useCodebridgeRuntime} from '../contexts';
import {useAppSelector} from '../redux/store';

import styles from './console.module.css';

/**
 * Run / Stop control for the console. Reflects the base `labSystem.isRunning`
 * flag (which the lab's runtime toggles) and invokes the runtime callbacks.
 * Ported and trimmed from apps/src/codebridge/Console/ControlButtons.tsx —
 * predict-level gating, metrics, and start-mode handling are deferred.
 */
const ControlButtons = () => {
  const {onRun, onStop} = useCodebridgeRuntime();
  const isRunning = useAppSelector(state => state.labSystem.isRunning);

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

  return (
    <Button
      variant="contained"
      color="primary"
      size="extraSmall"
      className={styles.controlButton}
      startIcon={<FontAwesomeV6Icon iconName="play" iconStyle="solid" />}
      onClick={() => onRun?.()}
      disabled={!onRun}
    >
      Run
    </Button>
  );
};

export default ControlButtons;

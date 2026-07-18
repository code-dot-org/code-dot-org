import {Button} from '@code-dot-org/component-library/button';

import {useCodebridgeRuntime} from '../contexts';
import {useAppSelector} from '../redux/store';

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
        text="Stop"
        iconLeft={{iconName: 'stop'}}
        onClick={() => onStop?.()}
        disabled={!onStop}
        type="primary"
        color="black"
        size="s"
      />
    );
  }

  return (
    <Button
      text="Run"
      iconLeft={{iconName: 'play'}}
      onClick={() => onRun?.()}
      disabled={!onRun}
      type="primary"
      color="purple"
      size="s"
    />
  );
};

export default ControlButtons;

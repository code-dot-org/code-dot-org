import OceansLab from '@code-dot-org/oceans-lab';
import '@code-dot-org/oceans-lab/styles.css';

import {useRegisterLabContext} from '@/modules/ai-tutor-host/useRegisterLabContext';

import styles from './guidedLesson.module.scss';

interface OceansLabStageProps {
  appMode: 'fishvtrash' | 'creaturesvtrashdemo' | 'creaturesvtrash';
}

/**
 * Mounts the AI for Oceans lab inside the guided lesson stage. Unlike the
 * Blockly labs, this one is canvas-based: it has its own internal "Continue"
 * flow via the `onContinue` prop, and there's no workspace to walk for a
 * deterministic check. The chat's stepControls.onNext handles advancement.
 *
 * Re-mounted per step (the host gives each lab step a different appMode);
 * the lab's `initAll` runs on every mount and tears down on unmount.
 */
const OceansLabStage = ({appMode}: OceansLabStageProps) => {
  useRegisterLabContext(() => ({
    labType: 'oceans',
    longInstructions: `AI for Oceans — mode: ${appMode}`,
  }));

  return (
    <div className={styles.musicLabHost}>
      <OceansLab appMode={appMode} />
    </div>
  );
};

export default OceansLabStage;

import React, {FC} from 'react';

import videoChallengeStyles from './video-challenge.module.scss';
import styles from './whiteboard-challenge.module.scss';

interface WhiteboardChallengeProps {
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
}

// Placeholder for an Excalidraw whiteboard panel, modeled on
// sketchlab's ExcalidrawSketchLabView. The canvas is not wired up yet.
const WhiteboardChallenge: FC<WhiteboardChallengeProps> = ({
  submitted,
  submitCallback,
}) => {
  const handleSubmit = () => {
    submitCallback(true);
  };

  return (
    <div>
      <div className={videoChallengeStyles.questionText}>
        {'DUMMY PROBLEM TEXT HERE'}
      </div>
      <div className={styles.whiteboardPlaceholder}>
        Excalidraw whiteboard goes here
      </div>
      <button
        type="button"
        className={videoChallengeStyles.submitButton}
        disabled={submitted}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default WhiteboardChallenge;

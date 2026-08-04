import React, {FC, useState} from 'react';

import VideoRecorder from './VideoRecorder';

// import freeResponseStyles from './free-response.module.scss';
import styles from './video-challenge.module.scss';

interface PracticeFreeResponseProps {
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
}

const FreeResponse: FC<PracticeFreeResponseProps> = ({
  submitted,
  submitCallback,
}) => {
  const [hasRecording, setHasRecording] = useState(false);

  const canSubmit = !submitted && hasRecording;

  const handleSubmit = () => {
    submitCallback(true);
  };

  return (
    <div>
      <VideoRecorder onRecordingChange={setHasRecording} disabled={submitted} />
      <button
        type="button"
        className={styles.submitButton}
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default FreeResponse;

import React, {FC, useState} from 'react';

import VideoChallenge from './VideoChallenge';
import WhiteboardChallenge from './WhiteboardChallenge';

import styles from './challenge-box.module.scss';

type ChallengeType = 'video' | 'whiteboard';

const ChallengeBox: FC = () => {
  const [submitted, setSubmitted] = useState(false);
  // Placeholder toggle while both challenge types are in development.
  const [challengeType, setChallengeType] = useState<ChallengeType>('video');

  const switchTo = (type: ChallengeType) => {
    setChallengeType(type);
    setSubmitted(false);
  };

  return (
    <div>
      <div className={styles.challengeToggle}>
        <button
          type="button"
          className={challengeType === 'video' ? styles.active : undefined}
          onClick={() => switchTo('video')}
        >
          Video
        </button>
        <button
          type="button"
          className={challengeType === 'whiteboard' ? styles.active : undefined}
          onClick={() => switchTo('whiteboard')}
        >
          Whiteboard
        </button>
      </div>
      {challengeType === 'video' ? (
        <VideoChallenge submitted={submitted} submitCallback={setSubmitted} />
      ) : (
        <WhiteboardChallenge
          submitted={submitted}
          submitCallback={setSubmitted}
        />
      )}
    </div>
  );
};

export default ChallengeBox;

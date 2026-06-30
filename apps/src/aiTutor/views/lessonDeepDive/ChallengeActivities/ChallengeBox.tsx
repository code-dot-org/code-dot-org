import React, {FC, useState} from 'react';

import VideoChallenge from './VideoChallenge';

const ChallengeBox: FC = () => {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div>
      <VideoChallenge submitted={submitted} submitCallback={setSubmitted} />
    </div>
  );
};

export default ChallengeBox;

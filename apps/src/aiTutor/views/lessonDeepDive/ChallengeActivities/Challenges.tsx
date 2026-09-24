import {Challenge} from '@code-dot-org/lesson-deep-dive';
import React, {FC, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';

import ChallengePicker from './ChallengePicker';

interface ChallengesProps {
  lessonId: number;
}

const Challenges: FC<ChallengesProps> = ({lessonId}) => {
  const navigate = useNavigate();

  const challengeSetCallback = useCallback(
    (pickedChallenge: Challenge | null, pickedChallengeType: string | null) => {
      if (pickedChallenge && pickedChallengeType) {
        navigate(`/challenge/${pickedChallenge.id}/${pickedChallengeType}`);
      }
    },
    [navigate]
  );

  return (
    <ChallengePicker
      lessonId={lessonId}
      challengeSetCallback={challengeSetCallback}
    />
  );
};

export default Challenges;

import React, {FC, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';

import {Challenge} from '../types';

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

import React, {FC, useCallback, useState} from 'react';

import {ChallengeTypes} from '@cdo/generated-scripts/sharedConstants';

import {Challenge} from '../types';

import ChallengeBox from './ChallengeBox';
import ChallengePicker from './ChallengePicker';

interface ChallengesProps {
  lessonId: number;
}

const Challenges: FC<ChallengesProps> = ({lessonId}) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeType, setChallengeType] = useState<string | null>(null);

  // Both challenge modalities report submission through this callback; the
  // confirmation dialog is shared here rather than duplicated per modality.
  const challengeSetCallback = useCallback(
    (pickedChallenge: Challenge, pickedChallengeType: string) => {
      setChallenge(pickedChallenge);
      setChallengeType(pickedChallengeType);
    },
    []
  );

  return challenge === null ? (
    <ChallengePicker
      lessonId={lessonId}
      challengeSetCallback={challengeSetCallback}
    />
  ) : (
    <ChallengeBox
      lessonId={lessonId}
      challenge={challenge}
      challengeType={challengeType || ChallengeTypes.WHITEBOARD}
    />
  );
};

export default Challenges;

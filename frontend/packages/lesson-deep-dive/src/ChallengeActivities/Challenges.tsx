import {type FC, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';

import {type Challenge} from '../types';

import ChallengePicker from './ChallengePicker';

interface ChallengesProps {
  lessonId: number;
  onReviewInstead?: () => void;
  onModalityChange?: (modality: 'video' | 'whiteboard') => void;
  onChallengeStarted?: (challenge: Challenge, challengeType: string) => void;
}

const Challenges: FC<ChallengesProps> = ({
  lessonId,
  onReviewInstead,
  onModalityChange,
  onChallengeStarted,
}) => {
  const navigate = useNavigate();

  const challengeSetCallback = useCallback(
    (pickedChallenge: Challenge | null, pickedChallengeType: string | null) => {
      if (pickedChallenge && pickedChallengeType) {
        onChallengeStarted?.(pickedChallenge, pickedChallengeType);
        navigate(`/challenge/${pickedChallenge.id}/${pickedChallengeType}`);
      }
    },
    [navigate, onChallengeStarted],
  );

  return (
    <ChallengePicker
      lessonId={lessonId}
      challengeSetCallback={challengeSetCallback}
      onReviewInstead={onReviewInstead}
      onModalityChange={onModalityChange}
    />
  );
};

export default Challenges;

import React, {FC, useCallback, useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {Challenge, challengeValidator} from '../types';

import VideoChallenge from './VideoChallenge';

interface ChallengeBoxProps {
  lessonId: number;
  lessonName: string;
}

const ChallengeBox: FC<ChallengeBoxProps> = ({lessonId, lessonName}) => {
  const [submitted, setSubmitted] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<null | Challenge>(
    null
  );

  const fetchChallenges = useCallback(() => {
    const params = new URLSearchParams();
    params.append('lesson_id', lessonId.toString());
    const query = params.toString();
    HttpClient.fetchJson<Challenge[]>(
      `/challenges?${query}`,
      {},
      challengeValidator
    ).then(response => {
      const challenges = response.value;
      if (!challenges || challenges.length === 0) return;
      //for now, just show the first challenge question
      setSelectedChallenge(challenges[0]);
    });
  }, [lessonId]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return (
    <div>
      <VideoChallenge
        submitted={submitted}
        submitCallback={setSubmitted}
        challenge={selectedChallenge}
      />
    </div>
  );
};

export default ChallengeBox;

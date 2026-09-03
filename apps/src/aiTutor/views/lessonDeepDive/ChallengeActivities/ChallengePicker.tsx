import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Button as MuiButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import {ChallengeTypes} from '@cdo/generated-scripts/sharedConstants';

import {Challenge, challengeValidator} from '../types';

import styles from './challenge-box.module.scss';

interface ChallengePickerProps {
  lessonId: number;
  challengeSetCallback: (
    pickedChallenge: Challenge,
    pickedChallengeType: string
  ) => void;
}

const ChallengePicker: FC<ChallengePickerProps> = ({
  lessonId,
  challengeSetCallback,
}) => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const [challengeList, setChallengeList] = useState<Challenge[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeType, setChallengeType] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    params.append('lesson_id', lessonId.toString());
    const query = params.toString();
    HttpClient.fetchJson<Challenge[]>(
      `/challenges?${query}`,
      {},
      challengeValidator
    )
      .then(({value}) => {
        if (cancelled) {
          return;
        }
        if (!value || value?.length === 0) {
          setLoadFailed(true);
          return;
        }
        setChallengeList(value);
        setChallenge(value[0]);
        setChallengeType(value[0].default_modality);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const onCarouselPress = (buttonValue: number) => {
    let currentIndex = currentChallengeIndex;
    currentIndex += buttonValue;
    if (currentIndex < 0) {
      currentIndex = challengeList.length - 1;
    } else if (currentIndex >= challengeList.length) {
      currentIndex = 0;
    }
    setCurrentChallengeIndex(currentIndex);
    setChallenge(challengeList[currentIndex]);
    setChallengeType(challengeList[currentIndex].default_modality);
  };

  return loadFailed ? (
    <Typography>We couldn&apos;t load challenges for this lesson.</Typography>
  ) : (
    <div className={styles.challengePickerContainer}>
      <div className={styles.challengeCarousel}>
        <IconButton
          type="button"
          variant="text"
          color="secondary"
          aria-label={'scroll challenge left'}
          onClick={() => onCarouselPress(-1)}
        >
          <FontAwesomeV6Icon iconName="angle-left" />
        </IconButton>
        <Typography variant="h3" className={styles.challengePickerText}>
          {challenge?.question}
        </Typography>
        <IconButton
          type="button"
          variant="text"
          color="secondary"
          aria-label={'scroll challenge right'}
          onClick={() => onCarouselPress(1)}
        >
          <FontAwesomeV6Icon iconName="angle-right" />
        </IconButton>
      </div>
      <div className={styles.challengePickerButtons}>
        <MuiButton
          className={classNames([
            styles.challengeTypeButton,
            challengeType === ChallengeTypes.WHITEBOARD
              ? styles.Selected
              : null,
          ])}
          size="medium"
          color="secondary"
          startIcon={
            <FontAwesomeV6Icon
              iconStyle="solid"
              iconName="pen-paintbrush"
              title="Whiteboard"
            />
          }
          variant="outlined"
          onClick={() => setChallengeType(ChallengeTypes.WHITEBOARD)}
        >
          Whiteboard
          {challenge?.default_modality === ChallengeTypes.WHITEBOARD && (
            <Typography variant="overline3" gutterBottom={false}>
              (recommended)
            </Typography>
          )}
        </MuiButton>
        <MuiButton
          className={classNames([
            styles.challengeTypeButton,
            challengeType === ChallengeTypes.VIDEO ? styles.Selected : null,
          ])}
          size="medium"
          color="secondary"
          startIcon={
            <FontAwesomeV6Icon
              iconStyle="solid"
              iconName="camera-movie"
              title="Video"
            />
          }
          variant="outlined"
          onClick={() => setChallengeType(ChallengeTypes.VIDEO)}
        >
          Video
          {challenge?.default_modality === ChallengeTypes.VIDEO && (
            <Typography variant="overline3" gutterBottom={false}>
              (recommended)
            </Typography>
          )}
        </MuiButton>
      </div>
      <MuiButton
        size="medium"
        color="primary"
        endIcon={
          <FontAwesomeV6Icon
            iconStyle="solid"
            iconName="arrow-right"
            title="Video"
          />
        }
        variant="contained"
        onClick={() => {
          if (challenge && challengeType) {
            challengeSetCallback(challenge, challengeType);
          }
        }}
      >
        Start the Challenge!
      </MuiButton>
    </div>
  );
};

export default ChallengePicker;

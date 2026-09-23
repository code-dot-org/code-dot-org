import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import HttpClient from '@cdo/apps/util/HttpClient';

import {Challenge, challengeValidator} from '../types';

import styles from './challenge-picker.module.scss';

type Modality = 'video' | 'whiteboard';

const MODALITIES: {id: Modality; label: string; icon: string}[] = [
  {id: 'video', label: 'Create a video', icon: 'video'},
  {id: 'whiteboard', label: 'Create on a whiteboard', icon: 'chalkboard'},
];

interface ChallengePickerProps {
  lessonId: number;
  challengeSetCallback: (
    pickedChallenge: Challenge | null,
    pickedChallengeType: string | null
  ) => void;
}

const ChallengePicker: FC<ChallengePickerProps> = ({
  lessonId,
  challengeSetCallback,
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [modality, setModality] = useState<Modality | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    params.append('lesson_id', lessonId.toString());
    HttpClient.fetchJson<Challenge[]>(
      `/challenges?${params}`,
      {},
      challengeValidator
    )
      .then(({value}) => {
        if (cancelled) return;
        if (!value || value.length === 0) {
          setLoadFailed(true);
          return;
        }
        setChallenges(value);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const filtered = modality
    ? challenges.filter(c => c.default_modality === modality)
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Choose your challenge</h2>

        <div className={styles.section}>
          <p className={styles.sectionLabel}>
            How do you want to create today?
          </p>
          <div className={styles.modalityRow}>
            {MODALITIES.map(m => {
              const isActive = modality === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.modalityCard} ${
                    isActive ? styles.modalityCardActive : ''
                  }`}
                  onClick={() => setModality(m.id)}
                >
                  <span
                    className={`${styles.modalityIcon} ${
                      isActive ? styles.modalityIconActive : ''
                    }`}
                  >
                    <FontAwesomeV6Icon iconName={m.icon} />
                  </span>
                  <span
                    className={`${styles.modalityLabel} ${
                      isActive ? styles.modalityLabelActive : ''
                    }`}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {modality && (
          <div className={styles.challengeList}>
            {loadFailed || filtered.length === 0 ? (
              <p className={styles.emptyState}>
                No challenges available for this mode.
              </p>
            ) : (
              filtered.map(challenge => (
                <div key={challenge.id} className={styles.challengeCard}>
                  <div className={styles.challengeCardText}>
                    <p className={styles.challengeCardOverline}>
                      Your Challenge
                    </p>
                    <p className={styles.challengeCardBody}>
                      {challenge.question}
                    </p>
                  </div>
                  <div className={styles.challengeCardCta}>
                    <button
                      type="button"
                      className={styles.startButton}
                      onClick={() => challengeSetCallback(challenge, modality)}
                    >
                      Start challenge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <button
          type="button"
          className={styles.reviewLink}
          onClick={() => navigate('/intervention')}
        >
          I want to review instead
        </button>
      </div>
    </div>
  );
};

export default ChallengePicker;

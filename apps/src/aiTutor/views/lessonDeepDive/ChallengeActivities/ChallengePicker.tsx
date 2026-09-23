import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC, useCallback, useEffect, useState} from 'react';
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
  const [challengeIndex, setChallengeIndex] = useState(0);
  const navigate = useNavigate();

  const handleModalityChange = useCallback((next: Modality) => {
    setModality(next);
    setChallengeIndex(0);
  }, []);

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
  const currentChallenge = filtered[challengeIndex] ?? null;
  const hasMultiple = filtered.length > 1;

  const goPrev = useCallback(
    () => setChallengeIndex(i => (i - 1 + filtered.length) % filtered.length),
    [filtered.length]
  );
  const goNext = useCallback(
    () => setChallengeIndex(i => (i + 1) % filtered.length),
    [filtered.length]
  );

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
                  onClick={() => handleModalityChange(m.id)}
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
          <div className={styles.challengeCarousel}>
            {hasMultiple && (
              <button
                type="button"
                className={styles.carouselButton}
                onClick={goPrev}
                aria-label="Previous challenge"
              >
                <FontAwesomeV6Icon iconName="angle-left" />
              </button>
            )}
            {loadFailed || !currentChallenge ? (
              <p className={styles.emptyState}>
                No challenges available for this mode.
              </p>
            ) : (
              <div className={styles.challengeCard}>
                <div className={styles.challengeCardText}>
                  <p className={styles.challengeCardOverline}>Your Challenge</p>
                  <p className={styles.challengeCardBody}>
                    {currentChallenge.question}
                  </p>
                </div>
                <div className={styles.challengeCardCta}>
                  <button
                    type="button"
                    className={styles.startButton}
                    onClick={() =>
                      challengeSetCallback(currentChallenge, modality)
                    }
                  >
                    Start challenge
                  </button>
                </div>
              </div>
            )}
            {hasMultiple && (
              <button
                type="button"
                className={styles.carouselButton}
                onClick={goNext}
                aria-label="Next challenge"
              >
                <FontAwesomeV6Icon iconName="angle-right" />
              </button>
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

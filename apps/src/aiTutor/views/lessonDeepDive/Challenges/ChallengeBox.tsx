import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC, useCallback, useState} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import CollaborativeActivity from './CollaborativeActivity';
import CreativeActivity from './CreativeActivity';
import CriticalActivity from './CriticalActivity';
import CuriousActivity from './CuriousActivity';

import styles from './challenge-box.module.scss';

// The four challenge "moods" a student can pick once they've rated every
// objective "Got it". Mirrors the modality navigation in InterventionBox: a
// menu of cards, then a bottom nav bar to switch between the spaces. The
// content of each space is a placeholder for now and will be built out next.
type ChallengeId = 'curious' | 'collaborative' | 'critical' | 'creative';

interface Card {
  id: ChallengeId;
  menuLabel: string;
  navLabel: string;
  icon: string;
  iconColor: string;
}

const CARDS: Card[] = [
  {
    id: 'curious',
    menuLabel: 'Curious',
    navLabel: 'Curious',
    icon: 'magnifying-glass',
    iconColor: '#00b4c8',
  },
  {
    id: 'collaborative',
    menuLabel: 'Collaborative',
    navLabel: 'Collaborative',
    icon: 'people-group',
    iconColor: '#e05353',
  },
  {
    id: 'critical',
    menuLabel: 'Critical',
    navLabel: 'Critical',
    icon: 'scale-balanced',
    iconColor: '#5cb85c',
  },
  {
    id: 'creative',
    menuLabel: 'Creative',
    navLabel: 'Creative',
    icon: 'palette',
    iconColor: '#f5c042',
  },
];

interface ChallengeBoxProps {
  lessonId: number;
  lessonName: string;
  onNext: () => void;
}

const ChallengeBox: FC<ChallengeBoxProps> = ({
  lessonId,
  lessonName,
  onNext,
}) => {
  const [selected, setSelected] = useState<ChallengeId | null>(null);
  const userId = useAppSelector(state => state.currentUser.userId);

  const handleNavSelect = useCallback(
    (toCardId: ChallengeId) => {
      if (selected && selected !== toCardId) {
        analyticsReporter.sendEvent(
          EVENTS.AI_TUTOR_LESSON_DEEP_DIVE_CHALLENGE_NAVIGATION,
          {
            from: selected,
            to: toCardId,
            lessonId,
            lessonName,
            userId,
          }
        );
      }
      setSelected(toCardId);
    },
    [selected, lessonId, lessonName, userId]
  );

  const handleCardSelect = useCallback(
    (cardId: ChallengeId) => {
      setSelected(cardId);
      analyticsReporter.sendEvent(
        EVENTS.AI_TUTOR_LESSON_DEEP_DIVE_CHALLENGE_CLICKED,
        {
          challenge: cardId,
          lessonId,
          lessonName,
          userId,
        }
      );
    },
    [lessonId, lessonName, userId]
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {!selected && (
          <div className={styles.prompt}>
            <p className={styles.overline}>{lessonName}</p>
            <h2 className={styles.heading}>Are you feeling...</h2>
            <p className={styles.subtitle}>
              Pick a challenge and we&apos;ll take it from there.
            </p>
            <div className={styles.menuList}>
              {CARDS.map(card => (
                <button
                  key={card.id}
                  type="button"
                  className={styles.menuCard}
                  onClick={() => handleCardSelect(card.id)}
                >
                  <span
                    className={styles.menuCardIcon}
                    style={{color: card.iconColor}}
                  >
                    <FontAwesomeV6Icon iconName={card.icon} />
                  </span>
                  {card.menuLabel}
                </button>
              ))}
            </div>
          </div>
        )}
        {selected === 'curious' && <CuriousActivity lessonId={lessonId} />}
        {selected === 'collaborative' && <CollaborativeActivity />}
        {selected === 'creative' && <CreativeActivity />}
        {selected === 'critical' && <CriticalActivity lessonId={lessonId} />}
      </div>

      <nav className={styles.bottomNav} aria-label="Challenge options">
        <button
          type="button"
          className={`${styles.navMenuButton} ${
            !selected ? styles.navMenuButtonActive : ''
          }`}
          onClick={() => setSelected(null)}
          aria-label="Challenge menu"
        >
          <FontAwesomeV6Icon iconName="grid-2" />
        </button>
        <div className={styles.navDivider} />
        {CARDS.map(card => {
          const isActive = selected === card.id;
          return (
            <button
              key={card.id}
              type="button"
              className={`${styles.navItem} ${
                isActive ? styles.navItemActive : ''
              }`}
              onClick={() => handleNavSelect(card.id)}
              aria-label={card.navLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <span style={{color: card.iconColor}}>
                <FontAwesomeV6Icon iconName={card.icon} />
              </span>
              <span className={styles.navLabel}>{card.navLabel}</span>
            </button>
          );
        })}
        <div className={styles.navDivider} />
        <div className={styles.doneWrapper}>
          <button type="button" className={styles.doneButton} onClick={onNext}>
            Done
            <FontAwesomeV6Icon iconName="arrow-right" />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ChallengeBox;

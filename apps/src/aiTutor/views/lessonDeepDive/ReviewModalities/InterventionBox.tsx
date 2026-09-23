import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {VocabularyFlashcards} from '@code-dot-org/lesson-deep-dive';
import React, {FC, useCallback, useState} from 'react';

import {
  LessonDeepDiveData,
  ReflectionData,
  AssessmentQuestionResult,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import experiments from '@cdo/apps/util/experiments';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import Challenges from '../ChallengeActivities/Challenges';

import Chat from './Chat';
import PodcastsBox from './PodcastsBox';
import VideosBox from './VideosBox';

import styles from './intervention-box.module.scss';

type CardId = 'flashcards' | 'chat' | 'videos' | 'podcasts' | 'challenge';

interface Card {
  id: CardId;
  label: string;
  navLabel: string;
  icon: string;
  iconColor: string;
}

// The four main practice modalities shown in the 2×2 choice grid.
const GRID_CARDS: Card[] = [
  {
    id: 'videos',
    label: 'Watch a video',
    navLabel: 'Video',
    icon: 'circle-play',
    iconColor: '#928cef',
  },
  {
    id: 'podcasts',
    label: 'Listen to a podcast',
    navLabel: 'Podcast',
    icon: 'headphones',
    iconColor: '#f07fb0',
  },
  {
    id: 'flashcards',
    label: 'Practice with flashcards',
    navLabel: 'Flashcards',
    icon: 'cards-blank',
    iconColor: '#7cdb87',
  },
  {
    id: 'chat',
    label: 'Chat with Tutor',
    navLabel: 'Chat',
    icon: 'messages',
    iconColor: '#ffd35c',
  },
];

const CHALLENGE_CARD: Card = {
  id: 'challenge',
  label: 'I want a challenge instead',
  navLabel: 'Challenge',
  icon: 'trophy',
  iconColor: '#f262ff',
};

interface InterventionBoxProps {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: LessonDeepDiveData['vocabulary'];
  assessmentAnalysis: AssessmentQuestionResult[];
  objectives: LessonDeepDiveData['objectives'];
  jsonVideos: LessonDeepDiveData['jsonVideos'];
  reflectionData: ReflectionData | null;
  focusTopic?: string;
  onNext: () => void;
}

const InterventionBox: FC<InterventionBoxProps> = ({
  lessonId,
  lessonName,
  lessonSummary,
  vocabulary,
  assessmentAnalysis,
  objectives,
  jsonVideos,
  reflectionData,
  focusTopic,
  onNext,
}) => {
  const [selected, setSelected] = useState<CardId | null>(null);
  const userId = useAppSelector(state => state.currentUser.userId);

  const handleNavSelect = useCallback(
    (toCardId: CardId) => {
      if (selected && selected !== toCardId) {
        analyticsReporter.sendEvent(
          EVENTS.AI_TUTOR_LESSON_DEEP_DIVE_MODALITY_NAVIGATION,
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
    (cardId: CardId) => {
      setSelected(cardId);
      analyticsReporter.sendEvent(
        EVENTS.AI_TUTOR_LESSON_DEEP_DIVE_MODALITY_CLICKED,
        {
          modality: cardId,
          lessonId,
          lessonName,
          userId,
        }
      );
    },
    [lessonId, lessonName, userId]
  );

  const challengeEnabled = experiments.isEnabled(
    experiments.LESSON_TUTOR_CHALLENGE
  );

  const navCards = challengeEnabled
    ? [...GRID_CARDS, CHALLENGE_CARD]
    : GRID_CARDS;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {!selected && (
          <div className={styles.prompt}>
            <div className={styles.promptInner}>
              <h2 className={styles.heading}>Let&apos;s get to work</h2>
              <p className={styles.subtext}>
                {focusTopic ? (
                  <>
                    {"Based on your reflection, we'll start with "}
                    <strong>{focusTopic.replace(/\.$/, '')}</strong>
                    {'. You can work any way you like from here.'}
                  </>
                ) : (
                  'You can work any way you like from here.'
                )}
              </p>
              <div className={styles.choiceGrid}>
                {GRID_CARDS.map(card => (
                  <button
                    key={card.id}
                    type="button"
                    className={styles.choiceCard}
                    onClick={() => handleCardSelect(card.id)}
                  >
                    <span
                      className={styles.cardIcon}
                      style={{color: card.iconColor}}
                    >
                      <FontAwesomeV6Icon iconName={card.icon} />
                    </span>
                    <span className={styles.cardLabel}>{card.label}</span>
                  </button>
                ))}
              </div>
              {challengeEnabled && (
                <button
                  type="button"
                  className={styles.challengeLink}
                  onClick={() => handleCardSelect('challenge')}
                >
                  {CHALLENGE_CARD.label}
                </button>
              )}
            </div>
          </div>
        )}
        {selected === 'flashcards' && (
          <VocabularyFlashcards vocabulary={vocabulary} />
        )}
        {selected === 'chat' && (
          <Chat
            lessonId={lessonId}
            lessonName={lessonName}
            lessonSummary={lessonSummary}
            vocabulary={vocabulary}
            assessmentAnalysis={assessmentAnalysis}
            objectives={objectives}
            reflectionData={reflectionData}
          />
        )}
        {selected === 'challenge' && <Challenges lessonId={lessonId} />}
        {selected === 'videos' && <VideosBox jsonVideos={jsonVideos} />}
        {selected === 'podcasts' && (
          <PodcastsBox
            lessonId={lessonId}
            reflectionData={reflectionData}
            objectives={objectives}
          />
        )}
      </div>

      {selected && (
        <nav className={styles.bottomNav} aria-label="Practice options">
          <button
            type="button"
            className={styles.navMenuButton}
            onClick={() => setSelected(null)}
            aria-label="Practice menu"
          >
            <FontAwesomeV6Icon iconName="grid-2" />
          </button>
          <div className={styles.navDivider} />
          {navCards.map(card => {
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
            <button
              type="button"
              className={styles.doneButton}
              onClick={onNext}
            >
              Done
              <FontAwesomeV6Icon iconName="arrow-right" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default InterventionBox;

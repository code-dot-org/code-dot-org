import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {VocabularyFlashcards} from '@code-dot-org/lesson-deep-dive';
import {Button as MuiButton, Typography} from '@mui/material';
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

// Modalities that show the bottom nav bar (excludes the choice grid and challenge).
const REVIEW_MODALITY_IDS = new Set<CardId>([
  'videos',
  'podcasts',
  'flashcards',
  'chat',
]);

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
  onDone?: () => void;
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
  onDone,
}) => {
  const [selected, setSelected] = useState<CardId | null>(null);
  const userId = useAppSelector(state => state.currentUser.userId);

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

  const showNavBar = selected !== null && REVIEW_MODALITY_IDS.has(selected);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {!selected && (
          <div className={styles.prompt}>
            <div className={styles.promptInner}>
              <Typography component="h2" className={styles.heading}>
                Let&apos;s get to work
              </Typography>
              <Typography className={styles.subtext}>
                {focusTopic ? (
                  <>
                    {`Based on your reflection, we'll start with "`}
                    <strong>{focusTopic.replace(/\.$/, '')}</strong>
                    {'". You can work any way you like from here.'}
                  </>
                ) : (
                  'You can work any way you like from here.'
                )}
              </Typography>
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
                <MuiButton
                  variant="text"
                  className={styles.challengeLink}
                  onClick={() => handleCardSelect('challenge')}
                >
                  {CHALLENGE_CARD.label}
                </MuiButton>
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
        {selected === 'challenge' && (
          <Challenges
            lessonId={lessonId}
            onReviewInstead={() => setSelected(null)}
          />
        )}
        {selected === 'videos' && <VideosBox jsonVideos={jsonVideos} />}
        {selected === 'podcasts' && (
          <PodcastsBox
            lessonId={lessonId}
            reflectionData={reflectionData}
            objectives={objectives}
          />
        )}
      </div>
      {showNavBar && (
        <nav className={styles.navBar} aria-label="Modality navigation">
          <button
            type="button"
            className={styles.navItem}
            onClick={() => setSelected(null)}
          >
            <span className={styles.navIcon}>
              <FontAwesomeV6Icon iconName="grid-2" />
            </span>
            <span>Home</span>
          </button>
          <div className={styles.navDivider} aria-hidden="true" />
          <div className={styles.navModalities}>
            {GRID_CARDS.map(card => (
              <button
                key={card.id}
                type="button"
                className={`${styles.navItem}${
                  selected === card.id ? ` ${styles.navItemActive}` : ''
                }`}
                onClick={() => handleCardSelect(card.id)}
                aria-current={selected === card.id ? 'page' : undefined}
              >
                <span className={styles.navIcon}>
                  <FontAwesomeV6Icon iconName={card.icon} />
                </span>
                <span>{card.navLabel}</span>
              </button>
            ))}
          </div>
          <div className={styles.navDivider} aria-hidden="true" />
          {onDone && (
            <button
              type="button"
              className={styles.doneButton}
              onClick={onDone}
            >
              Done
              <span className={styles.doneIcon}>
                <FontAwesomeV6Icon iconName="arrow-right" />
              </span>
            </button>
          )}
        </nav>
      )}
    </div>
  );
};

export default InterventionBox;

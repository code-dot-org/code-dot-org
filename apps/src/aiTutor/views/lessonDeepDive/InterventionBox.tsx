import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import React, {FC, useCallback, useState} from 'react';

const lightTheme = createTheme({palette: {mode: 'light'}});

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import LessonDeepDiveTutorChat from './LessonDeepDiveTutorChat';
import PodcastsBox from './PodcastsBox';
import {
  LessonDeepDiveData,
  ReflectionData,
  AssessmentQuestionResult,
} from './types';
import VideosBox from './VideosBox';
import VocabularyFlashcards from './VocabularyFlashcards';

import styles from './intervention-box.module.scss';

type CardId = 'flashcards' | 'chat' | 'videos' | 'podcasts';

interface Card {
  id: CardId;
  menuLabel: string;
  navLabel: string;
  icon: string;
  iconColor: string;
}

const CARDS: Card[] = [
  {
    id: 'videos',
    menuLabel: 'Watch a video',
    navLabel: 'Video',
    icon: 'circle-play',
    iconColor: '#00b4c8',
  },
  {
    id: 'podcasts',
    menuLabel: 'Listen to a podcast',
    navLabel: 'Podcast',
    icon: 'headphones',
    iconColor: '#e05353',
  },
  {
    id: 'flashcards',
    menuLabel: 'Practice with flashcards',
    navLabel: 'Flashcards',
    icon: 'cards-blank',
    iconColor: '#5cb85c',
  },
  {
    id: 'chat',
    menuLabel: 'Chat with Tutor',
    navLabel: 'Chat',
    icon: 'messages',
    iconColor: '#f5c042',
  },
];

interface InterventionBoxProps {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: LessonDeepDiveData['vocabulary'];
  assessmentAnalysis: AssessmentQuestionResult[];
  objectives: LessonDeepDiveData['objectives'];
  jsonVideos: LessonDeepDiveData['jsonVideos'];
  reflectionData: ReflectionData | null;
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

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {!selected && (
          <div className={styles.prompt}>
            <p className={styles.overline}>{lessonName}</p>
            <h2 className={styles.heading}>How do you want to practice?</h2>
            <p className={styles.subtitle}>
              Pick a mode and we&apos;ll get you going.
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
        {selected === 'flashcards' && (
          <VocabularyFlashcards vocabulary={vocabulary} />
        )}
        {selected === 'chat' && (
          <ThemeProvider theme={lightTheme}>
            <LessonDeepDiveTutorChat
              lessonId={lessonId}
              lessonName={lessonName}
              lessonSummary={lessonSummary}
              vocabulary={vocabulary}
              assessmentAnalysis={assessmentAnalysis}
              objectives={objectives}
              reflectionData={reflectionData}
            />
          </ThemeProvider>
        )}
        {selected === 'videos' && <VideosBox jsonVideos={jsonVideos} />}
        {selected === 'podcasts' && <PodcastsBox />}
      </div>

      <nav className={styles.bottomNav} aria-label="Practice options">
        <button
          type="button"
          className={`${styles.navMenuButton} ${
            !selected ? styles.navMenuButtonActive : ''
          }`}
          onClick={() => setSelected(null)}
          aria-label="Practice menu"
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

export default InterventionBox;

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
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
  label: string;
  icon: string;
  colorClass: string;
  activeColorClass: string;
}

const CARDS: Card[] = [
  {
    id: 'flashcards',
    label: 'Flashcards',
    icon: 'cards-blank',
    colorClass: styles.cardTeal,
    activeColorClass: styles.activeCardTeal,
  },
  {
    id: 'chat',
    label: 'Chat with Tutor',
    icon: 'comment',
    colorClass: styles.cardPurple,
    activeColorClass: styles.activeCardPurple,
  },
  {
    id: 'videos',
    label: 'Videos',
    icon: 'circle-play',
    colorClass: styles.cardOrange,
    activeColorClass: styles.activeCardOrange,
  },
  {
    id: 'podcasts',
    label: 'Podcasts',
    icon: 'headphones',
    colorClass: styles.cardBlue,
    activeColorClass: styles.activeCardBlue,
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

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {!selected && (
          <div className={styles.prompt}>
            <Typography
              variant="h2"
              sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}
            >
              How would you like to review the material?
            </Typography>
            <Typography variant="body1">
              Let&apos;s revisit any concepts that were challenging and work
              through them together.
            </Typography>
            <div className={styles.grid}>
              {CARDS.map(card => (
                <button
                  key={card.id}
                  type="button"
                  className={`${styles.card} ${card.colorClass}`}
                  onClick={() => handleCardSelect(card.id)}
                  aria-label={card.label}
                >
                  <FontAwesomeV6Icon iconName={card.icon} />
                  <span className={styles.cardLabel}>{card.label}</span>
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

      {selected && (
        <nav className={styles.bottomNav} aria-label="Practice options">
          {CARDS.map(card => {
            const isActive = selected === card.id;
            return (
              <button
                key={card.id}
                type="button"
                className={`${styles.navItem} ${
                  isActive ? card.activeColorClass : ''
                }`}
                onClick={() => setSelected(card.id)}
                aria-label={card.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <FontAwesomeV6Icon iconName={card.icon} />
                <span className={styles.navLabel}>{card.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default InterventionBox;

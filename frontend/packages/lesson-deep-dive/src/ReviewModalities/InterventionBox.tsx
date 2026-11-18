import {Button as MuiButton, Typography} from '@mui/material';
import {type FC, useCallback, useRef, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {EVENTS} from '../analyticsEvents';
import Challenges from '../ChallengeActivities/Challenges';
import {
  type AssessmentQuestionResult,
  type JsonVideoData,
  type LessonObjective,
  type ReflectionData,
  type SendEvent,
} from '../types';

import Chat, {type TutorChatComponent} from './Chat';
import PodcastsBox from './PodcastsBox';
import VideosBox, {type VideoPlayerComponent} from './VideosBox';
import VocabularyFlashcards, {
  type VocabularyItem,
} from './VocabularyFlashcards';

import styles from './intervention-box.module.scss';

export type CardId =
  | 'flashcards'
  | 'chat'
  | 'videos'
  | 'podcasts'
  | 'challenge';

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
  vocabulary: VocabularyItem[];
  assessmentAnalysis: AssessmentQuestionResult[];
  objectives: LessonObjective[];
  jsonVideos: JsonVideoData[];
  reflectionData: ReflectionData | null;
  focusTopic?: string;
  initialSelection?: CardId | null;
  challengeEnabled: boolean;
  VideoPlayer: VideoPlayerComponent;
  TutorChat: TutorChatComponent;
  sendEvent: SendEvent;
  onModalitySelected?: (modality: CardId) => void;
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
  initialSelection = null,
  challengeEnabled,
  VideoPlayer,
  TutorChat,
  sendEvent,
  onModalitySelected,
  onDone,
}) => {
  const [selected, setSelected] = useState<CardId | null>(initialSelection);
  const startTimeRef = useRef(Date.now());
  const modalitiesUsedRef = useRef(new Set<CardId>());

  const handleCardSelect = useCallback(
    (cardId: CardId, source: 'picker' | 'tab_switch') => {
      setSelected(cardId);
      onModalitySelected?.(cardId);
      if (cardId === 'challenge') {
        sendEvent(EVENTS.TUTOR_PLUS_NEXT_STEP_CHOSEN, {
          lesson_id: lessonId,
          choice: 'challenge',
          source: 'practice_screen',
        });
      } else {
        modalitiesUsedRef.current.add(cardId);
        sendEvent(EVENTS.TUTOR_PLUS_PRACTICE_MODALITY_SELECTED, {
          lesson_id: lessonId,
          modality: cardId,
          source,
        });
      }
    },
    [lessonId, onModalitySelected, sendEvent],
  );

  const handleReviewInstead = useCallback(() => {
    sendEvent(EVENTS.TUTOR_PLUS_NEXT_STEP_CHOSEN, {
      lesson_id: lessonId,
      choice: 'practice',
      source: 'challenge_screen',
    });
    setSelected(null);
  }, [lessonId, sendEvent]);

  const handleChallengeModalityChange = useCallback(
    (type: 'video' | 'whiteboard') => {
      sendEvent(EVENTS.TUTOR_PLUS_CHALLENGE_TYPE_SELECTED, {
        lesson_id: lessonId,
        type,
      });
    },
    [lessonId, sendEvent],
  );

  const handleChallengeStarted = useCallback(
    (challenge: {id: number}, type: string) => {
      sendEvent(EVENTS.TUTOR_PLUS_CHALLENGE_STARTED, {
        lesson_id: lessonId,
        challenge_id: challenge.id,
        type,
      });
    },
    [lessonId, sendEvent],
  );

  const handleDone = useCallback(() => {
    sendEvent(EVENTS.TUTOR_PLUS_PRACTICE_DONE, {
      lesson_id: lessonId,
      modalities_used: Array.from(modalitiesUsedRef.current),
      duration_seconds: Math.round((Date.now() - startTimeRef.current) / 1000),
    });
    onDone?.();
  }, [lessonId, onDone, sendEvent]);

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
                    onClick={() => handleCardSelect(card.id, 'picker')}
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
                  onClick={() => handleCardSelect('challenge', 'picker')}
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
            TutorChat={TutorChat}
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
            onReviewInstead={handleReviewInstead}
            onModalityChange={handleChallengeModalityChange}
            onChallengeStarted={handleChallengeStarted}
          />
        )}
        {selected === 'videos' && (
          <VideosBox jsonVideos={jsonVideos} VideoPlayer={VideoPlayer} />
        )}
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
                onClick={() => handleCardSelect(card.id, 'tab_switch')}
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
              onClick={handleDone}
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

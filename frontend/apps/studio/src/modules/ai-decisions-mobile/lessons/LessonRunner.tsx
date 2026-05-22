/**
 * LessonRunner — dispatches to per-kind level renderer and manages progress.
 *
 * Responsibilities:
 *   1. Load the current level from unit1.json content (by lessonId + levelId)
 *   2. Dispatch to the appropriate renderer by Level.kind
 *   3. On level completion: call recordLevelCompletion, persist progress,
 *      advance to next level or fire lessonComplete
 *   4. Handle back-chevron (onBack → /m/journey) and emit journeyReturn event
 *
 * The component does NOT own seat/progress state — it receives callbacks
 * from the route component which owns useActiveSeat.
 */

import {Box} from '@mui/material';
import {useCallback, useEffect} from 'react';

import type {Level, Lesson} from '../content/types';
import {useLanguage} from '../i18n/StringsProvider';
import {JOURNEY_RETURN_EVENT} from '../journey/useAutoScroll';
import type {JourneyProgress} from '../seats/types';
import {stop} from '../tts/tts';

import {BubbleChoiceRenderer} from './capstone/BubbleChoiceRenderer';
import {DanceEmojiPickRenderer} from './dance/DanceEmojiPickRenderer';
import {LessonChrome} from './LessonChrome';
import {MatchRenderer} from './match/MatchRenderer';
import {MultiRenderer} from './multi/MultiRenderer';
import {OceansLabelingRenderer} from './oceans/OceansLabelingRenderer';
import {ReadingRenderer} from './reading/ReadingRenderer';
import {SurveyRenderer} from './survey/SurveyRenderer';
import {VideoRenderer} from './video/VideoRenderer';

export interface LessonRunnerProps {
  lesson: Lesson;
  level: Level;
  progress: JourneyProgress | null;
  /** Called when the learner completes the current level. */
  onLevelComplete: (levelId: string, perfect: boolean) => void;
  /** Called to navigate back to the journey map. */
  onBack: () => void;
  /** Called when learner toggles language. */
  onToggleLanguage: (lang: 'en' | 'hi') => void;
}

/** Dispatch table from LevelKind to renderer component. */
function renderLevel(level: Level, onComplete: (perfect: boolean) => void) {
  const props = {level, onComplete};
  switch (level.kind) {
    case 'multi':
      return <MultiRenderer {...props} />;
    case 'match':
      return <MatchRenderer {...props} />;
    case 'survey':
      return <SurveyRenderer {...props} />;
    case 'reading':
      return <ReadingRenderer {...props} />;
    case 'video':
    case 'dance-intro-video':
    case 'oceans-video':
      return <VideoRenderer {...props} />;
    case 'oceans-labeling':
      return <OceansLabelingRenderer {...props} />;
    case 'dance-emoji-pick':
      return <DanceEmojiPickRenderer {...props} />;
    case 'bubble-choice':
      return <BubbleChoiceRenderer {...props} />;
    default: {
      // Exhaustiveness: assigning level.kind to a `never` type below
      // forces a compile error if a new LevelKind is added without a
      // renderer arm above.
      const unreachable: never = level.kind;
      void unreachable;
      return null;
    }
  }
}

/**
 * Lesson runner shell.  Renders LessonChrome at the top and the active
 * level renderer in the scrollable body below.
 */
export function LessonRunner({
  lesson,
  level,
  onLevelComplete,
  onBack,
  onToggleLanguage,
}: LessonRunnerProps) {
  const lang = useLanguage();

  // Cancel any in-flight TTS when navigating away from the lesson (FR-022).
  useEffect(
    () => () => {
      void stop();
    },
    [],
  );

  const handleBack = useCallback(() => {
    // Emit journeyReturn so useAutoScroll re-centres on current bubble.
    window.dispatchEvent(new CustomEvent(JOURNEY_RETURN_EVENT));
    onBack();
  }, [onBack]);

  const lessonName = lang === 'hi' ? lesson.name.hi : lesson.name.en;

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <LessonChrome
        lessonName={lessonName}
        lang={lang}
        onBack={handleBack}
        onToggleLanguage={onToggleLanguage}
      />
      {/* key={level.id} forces remount on level change, resetting hook state. */}
      <Box key={level.id} sx={{flex: 1, overflowY: 'auto'}}>
        {renderLevel(level, perfect => onLevelComplete(level.id, perfect))}
      </Box>
    </Box>
  );
}

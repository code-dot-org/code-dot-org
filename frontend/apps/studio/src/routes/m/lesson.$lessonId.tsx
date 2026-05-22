import {Box, Typography} from '@mui/material';
import {createFileRoute, useNavigate, useSearch} from '@tanstack/react-router';
import {useState, useCallback, useEffect} from 'react';

import {LessonCompleteCelebration} from '@/modules/ai-decisions-mobile/celebration/LessonCompleteCelebration';
import {LevelCompleteBeat} from '@/modules/ai-decisions-mobile/celebration/LevelCompleteBeat';
import {UnitCompleteCelebration} from '@/modules/ai-decisions-mobile/celebration/UnitCompleteCelebration';
import type {Unit} from '@/modules/ai-decisions-mobile/content/types';
import unit1Data from '@/modules/ai-decisions-mobile/content/unit1.json';
import {StringsProvider} from '@/modules/ai-decisions-mobile/i18n/StringsProvider';
import {LessonRunner} from '@/modules/ai-decisions-mobile/lessons/LessonRunner';
import {
  readSeatProgress,
  writeSeatProgress,
} from '@/modules/ai-decisions-mobile/seats/storage';
import type {
  Language,
  JourneyProgress,
  LessonProgress,
} from '@/modules/ai-decisions-mobile/seats/types';
import {useActiveSeat} from '@/modules/ai-decisions-mobile/seats/useActiveSeat';

/** Unit data cast to typed Unit. */
const unit = unit1Data as unknown as Unit;

/** Inner component — has access to StringsProvider. */
function LessonPageInner({lessonId, lang}: {lessonId: string; lang: Language}) {
  const navigate = useNavigate();
  const {activeSeat, isLoading} = useActiveSeat();
  const search = useSearch({strict: false}) as {startLevel?: number | string};
  const [levelIndex, setLevelIndex] = useState(() => {
    // TanStack Router serializes search params via JSON, so numeric values
    // arrive as numbers and string values arrive as strings.  Coerce.
    const raw = search.startLevel;
    const n = typeof raw === 'number' ? raw : parseInt(raw ?? '', 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  });
  /** True between final-level completion and the learner tapping Continue. */
  const [celebrating, setCelebrating] = useState(false);
  /** True when the LAST lesson of the unit is also complete — show the
   * bigger 🏆 unit-complete celebration instead of the per-lesson one. */
  const [unitCelebrating, setUnitCelebrating] = useState(false);
  /** True between non-final-level completion and the auto-advance to the next level. */
  const [betweenLevels, setBetweenLevels] = useState(false);

  const lessons = unit.units[0]?.lessons ?? [];
  const lesson = lessons.find(l => String(l.id) === lessonId);
  const isLastLessonOfUnit =
    lesson !== undefined && lessons[lessons.length - 1]?.id === lesson.id;

  const handleBack = useCallback(() => {
    void navigate({to: '/m/journey'});
  }, [navigate]);

  const handleToggleLanguage = useCallback(() => {
    // Language changes handled at JourneyPage level — no-op here.
  }, []);

  const handleLevelComplete = useCallback(
    async (levelId: string, perfect: boolean) => {
      if (!lesson) return;
      // Persist progress only if we have a seat — but the celebration /
      // advancement MUST run regardless, so the learner always gets feedback
      // even if seat state is mid-load.
      if (activeSeat) {
        const nextLevelId = lesson.levels[levelIndex + 1]?.id ?? levelId;
        const prior = (await readSeatProgress(activeSeat.id)) ?? {
          seatId: activeSeat.id,
          currentLessonId: lesson.id,
          currentLevelId: lesson.levels[0]?.id ?? '',
          lessons: {} as Record<number, LessonProgress>,
          revision: 0,
          schemaVersion: 1 as const,
        };
        const priorLesson = prior.lessons[lesson.id] ?? {
          visited: true,
          complete: false,
          levels: {},
        };
        const priorLevel = priorLesson.levels[levelId] ?? {
          visited: false,
          perfectLastRun: false,
          completions: 0,
          mastery: 0 as const,
        };
        // Mastery: 1st perfect → 3 (mastered); else bump by 1 up to 2.
        const nextMastery: 0 | 1 | 2 | 3 =
          priorLevel.mastery === 3
            ? 3
            : perfect && priorLevel.completions === 0
              ? 3
              : (Math.min(2, priorLevel.mastery + 1) as 0 | 1 | 2 | 3);
        const isLastLevel = levelIndex + 1 >= lesson.levels.length;
        const updated: JourneyProgress = {
          ...prior,
          currentLessonId: lesson.id,
          currentLevelId: isLastLevel ? levelId : nextLevelId,
          lessons: {
            ...prior.lessons,
            [lesson.id]: {
              ...priorLesson,
              visited: true,
              complete: isLastLevel ? true : priorLesson.complete,
              levels: {
                ...priorLesson.levels,
                [levelId]: {
                  visited: true,
                  perfectLastRun: perfect,
                  completions: priorLevel.completions + 1,
                  mastery: nextMastery,
                },
              },
            },
          },
          revision: prior.revision + 1,
        };
        void writeSeatProgress(updated);
      }
      // Non-final level → show a brief "Nice!" beat before advancing.
      // Final level of an interior lesson → show the lesson-complete celebration.
      // Final level of the LAST lesson → show the unit-complete celebration.
      const nextIndex = levelIndex + 1;
      if (nextIndex < lesson.levels.length) {
        setBetweenLevels(true);
      } else if (isLastLessonOfUnit) {
        setUnitCelebrating(true);
      } else {
        setCelebrating(true);
      }
    },
    [activeSeat, lesson, levelIndex, isLastLessonOfUnit],
  );

  /** Called by LevelCompleteBeat once its display duration is up. */
  const handleBetweenLevelsDone = useCallback(() => {
    setBetweenLevels(false);
    setLevelIndex(idx => idx + 1);
  }, []);

  const handleCelebrationContinue = useCallback(() => {
    setCelebrating(false);
    void navigate({to: '/m/journey'});
  }, [navigate]);

  const handleUnitCelebrationContinue = useCallback(() => {
    setUnitCelebrating(false);
    void navigate({to: '/m/journey'});
  }, [navigate]);

  // Direct nav to a lesson without an active seat → progress can't persist.
  // Redirect to the seat picker (which routes onward to journey once a
  // seat is chosen).
  useEffect(() => {
    if (!isLoading && !activeSeat) {
      void navigate({to: '/m/seats'});
    }
  }, [isLoading, activeSeat, navigate]);

  // On mount, scroll body to top — entering a lesson from the journey
  // shouldn't inherit the journey's scroll position.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading || !activeSeat) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        Loading…
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box sx={{padding: 2}}>
        <Typography>Lesson {lessonId} not found.</Typography>
      </Box>
    );
  }

  const level = lesson.levels[levelIndex];
  if (!level) {
    return (
      <Box sx={{padding: 2}}>
        <Typography>No levels in lesson {lessonId}.</Typography>
      </Box>
    );
  }

  // Unit-complete celebration — final lesson done.  Takes precedence
  // over the per-lesson celebration.
  if (unitCelebrating) {
    return (
      <UnitCompleteCelebration
        unitName={
          lang === 'hi'
            ? (unit.units[0]?.name.hi ?? '')
            : (unit.units[0]?.name.en ?? '')
        }
        lang={lang}
        onContinue={handleUnitCelebrationContinue}
      />
    );
  }

  // Lesson-complete celebration — last level of an interior lesson done.
  if (celebrating) {
    return (
      <LessonCompleteCelebration
        lessonName={lang === 'hi' ? lesson.name.hi : lesson.name.en}
        lang={lang}
        onContinue={handleCelebrationContinue}
      />
    );
  }

  // Between-levels beat — auto-advances after ~1.2s to the next level.
  if (betweenLevels) {
    return <LevelCompleteBeat lang={lang} onDone={handleBetweenLevelsDone} />;
  }

  return (
    <LessonRunner
      lesson={lesson}
      level={level}
      progress={null}
      onLevelComplete={handleLevelComplete}
      onBack={handleBack}
      onToggleLanguage={handleToggleLanguage}
    />
  );
}

/** Lesson runner route — dispatches to per-kind level renderers. */
function LessonPage() {
  const {lessonId} = Route.useParams();
  const {activeSeat} = useActiveSeat();
  const lang: Language = activeSeat?.language ?? 'en';

  return (
    <StringsProvider lang={lang}>
      <LessonPageInner lessonId={lessonId} lang={lang} />
    </StringsProvider>
  );
}

export const Route = createFileRoute('/m/lesson/$lessonId')({
  component: LessonPage,
});

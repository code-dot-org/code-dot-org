import {Box} from '@mui/material';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {useEffect, useRef, useState} from 'react';

import type {Unit} from '@/modules/ai-decisions-mobile/content/types';
import unit1Data from '@/modules/ai-decisions-mobile/content/unit1.json';
import {
  StringsProvider,
  useLanguage,
} from '@/modules/ai-decisions-mobile/i18n/StringsProvider';
import {JourneyChrome} from '@/modules/ai-decisions-mobile/journey/JourneyChrome';
import {JourneyPath} from '@/modules/ai-decisions-mobile/journey/JourneyPath';
import {useAutoScroll} from '@/modules/ai-decisions-mobile/journey/useAutoScroll';
import {
  PROGRESS_UPDATED_EVENT,
  readSeatProgress,
} from '@/modules/ai-decisions-mobile/seats/storage';
import type {
  JourneyProgress,
  Language,
  SeatId,
} from '@/modules/ai-decisions-mobile/seats/types';
import {useActiveSeat} from '@/modules/ai-decisions-mobile/seats/useActiveSeat';

const unit = unit1Data as unknown as Unit;
const lessons = unit.units[0]?.lessons ?? [];

/**
 * Builds a fresh-seat fallback progress: first level is `current`, nothing
 * completed.  Used until the real persisted progress loads (or when the
 * seat has never completed a level).
 */
function makeDefaultProgress(seatId: SeatId): JourneyProgress {
  return {
    seatId,
    currentLessonId: lessons[0]?.id ?? 0,
    currentLevelId: lessons[0]?.levels[0]?.id ?? '',
    lessons: {},
    revision: 0,
    schemaVersion: 1,
  };
}

interface JourneyInnerProps {
  onToggleLanguage: (lang: Language) => void;
  seatColor: Parameters<typeof JourneyChrome>[0]['seatColor'];
  seatId: SeatId | null;
}

/** Inner component reads lang from StringsProvider (single source of truth). */
function JourneyInner({
  onToggleLanguage,
  seatColor,
  seatId,
}: JourneyInnerProps) {
  const lang = useLanguage();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  /** Loaded seat progress, or null while still loading / no seat. */
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  /** False until the first storage read completes — gates the bubble render
   * to avoid a brief flash where only ch1 looks unlocked. */
  const [progressLoaded, setProgressLoaded] = useState(false);

  // Load persisted progress from Capacitor Preferences for the active seat.
  // Re-runs whenever the seatId changes (e.g. seat-switch on the picker),
  // AND whenever the lesson page fires PROGRESS_UPDATED_EVENT after a
  // level completion (so the journey reflects fresh state on return).
  // On a fresh seat with no persisted record, fall back to a default
  // that marks the first level as `current` so the journey is enterable.
  useEffect(() => {
    if (!seatId) {
      setProgress(null);
      setProgressLoaded(true);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const stored = await readSeatProgress(seatId);
      if (cancelled) return;
      setProgress(stored ?? makeDefaultProgress(seatId));
      setProgressLoaded(true);
    };
    void load();
    const handler = () => {
      void load();
    };
    window.addEventListener(PROGRESS_UPDATED_EVENT, handler);
    return () => {
      cancelled = true;
      window.removeEventListener(PROGRESS_UPDATED_EVENT, handler);
    };
  }, [seatId]);

  useAutoScroll(scrollRef, progress);

  function handleBubbleTap(levelId: string) {
    for (const lesson of lessons) {
      const idx = lesson.levels.findIndex(l => l.id === levelId);
      if (idx >= 0) {
        // Pass startLevel so the lesson opens at the exact bubble the
        // learner tapped (not always at the lesson's first level).
        void navigate({
          to: '/m/lesson/$lessonId',
          params: {lessonId: String(lesson.id)},
          search: {startLevel: idx},
        });
        return;
      }
    }
  }

  // The journey top chrome shows the COURSE name (FR-002d), not the
  // unit name.  Studio's prod label for `k5-ai-data-2024` is "How AI
  // Makes Decisions"; the unit-1 wrapper exists only because the script
  // model nests lessons under units even when there's just one.
  const courseName =
    lang === 'hi' ? (unit.name?.hi ?? '') : (unit.name?.en ?? '');

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      <JourneyChrome
        title={courseName}
        seatColor={seatColor}
        lang={lang}
        onToggleLanguage={onToggleLanguage}
        onTapLogo={() => void navigate({to: '/m/home'})}
        onTapSeat={() => void navigate({to: '/m/seats'})}
      />
      {/*
       * Constrain the journey to a mobile-realistic max width so the path
       * stays centered when the PWA renders on a desktop browser.  On a
       * 360-dp Android phone this resolves to full width; on a wide
       * browser, the journey sits centered with neutral side gutters.
       */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          width: '100%',
          maxWidth: 480,
          marginX: 'auto',
        }}
      >
        {progressLoaded && (
          <JourneyPath
            lessons={lessons}
            lang={lang}
            progress={progress}
            onBubbleTap={handleBubbleTap}
          />
        )}
      </Box>
    </Box>
  );
}

/** Journey map screen — owns seat state, threads lang into StringsProvider. */
function JourneyPage() {
  const {activeSeat, isLoading, setLanguage} = useActiveSeat();
  const navigate = useNavigate();
  const lang: Language = activeSeat?.language ?? 'en';

  async function handleToggleLanguage(newLang: Language) {
    await setLanguage(newLang);
  }

  // Without an active seat, progress can't be persisted (handleLevelComplete
  // short-circuits on !activeSeat).  Redirect to the seat picker rather
  // than silently dropping writes — the seat picker IS the home screen
  // per FR-002i.
  useEffect(() => {
    if (!isLoading && !activeSeat) {
      void navigate({to: '/m/seats'});
    }
  }, [isLoading, activeSeat, navigate]);

  if (isLoading || !activeSeat) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        Loading…
      </Box>
    );
  }

  return (
    <StringsProvider lang={lang}>
      <JourneyInner
        onToggleLanguage={handleToggleLanguage}
        seatColor={activeSeat.color}
        seatId={activeSeat.id}
      />
    </StringsProvider>
  );
}

export const Route = createFileRoute('/m/journey')({
  component: JourneyPage,
});

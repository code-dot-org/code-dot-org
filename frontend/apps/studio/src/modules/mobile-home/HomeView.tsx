/**
 * HomeView — journey-picker home screen.
 *
 * Displays one JourneyTile per registered journey.  Tiles are filtered by
 * the deployment's homeGradeBands (if set), then sorted: the journey the
 * learner is currently in-progress on (state === 'continue') floats to the
 * top, the rest follow manifest order.
 *
 * Tapping a tile navigates to /m/journey/$journeyId.  When lock=true, the
 * navigation uses replace so the picker is not in back-navigation history.
 */

import {Box, Typography} from '@mui/material';
import {useNavigate} from '@tanstack/react-router';
import {useMemo} from 'react';

import {getHomeGradeBands} from '@/config/siteConfig';
import {useActiveSeat} from '@/modules/seats/useActiveSeat';

import {JOURNEYS} from './journeys';
import type {JourneyManifest, JourneyState} from './journeys/types';
import {JourneyTile} from './JourneyTile';

/** Props for HomeView. */
export interface HomeViewProps {
  /** When true, tile navigation removes home from browser history (kiosk mode). */
  lock?: boolean;
}

/** Sorts manifests so in-progress journeys appear first (resume-hoist). */
export function sortByResumeHoist(
  manifests: JourneyManifest[],
  getState: (m: JourneyManifest) => JourneyState,
): JourneyManifest[] {
  return [...manifests].sort((a, b) => {
    const stateA = getState(a);
    const stateB = getState(b);
    if (stateA === 'continue' && stateB !== 'continue') return -1;
    if (stateB === 'continue' && stateA !== 'continue') return 1;
    return 0;
  });
}

/** Journey-picker home screen component. */
export function HomeView({lock = false}: HomeViewProps) {
  const navigate = useNavigate();
  const {activeSeat, isLoading} = useActiveSeat();

  const gradeBands = getHomeGradeBands();

  const filteredJourneys = useMemo(() => {
    if (gradeBands === undefined) return JOURNEYS;
    return JOURNEYS.filter(
      j => j.gradeBand === undefined || gradeBands.includes(j.gradeBand),
    );
  }, [gradeBands]);

  const sortedJourneys = useMemo(() => {
    if (activeSeat === null) return filteredJourneys;
    return sortByResumeHoist(filteredJourneys, m =>
      m.progressSelector(activeSeat),
    );
  }, [filteredJourneys, activeSeat]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Typography>Loading…</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 480,
        marginX: 'auto',
      }}
    >
      <Typography variant="h5" component="h1" fontWeight={700}>
        Choose a journey
      </Typography>

      {sortedJourneys.map(journey => (
        <JourneyTile
          key={journey.id}
          title={journey.title}
          description={journey.description}
          state={
            activeSeat !== null ? journey.progressSelector(activeSeat) : 'start'
          }
          gradeBand={journey.gradeBand}
          onTap={() =>
            void navigate({
              to: '/m/journey/$journeyId',
              params: {journeyId: journey.id},
              replace: lock,
            })
          }
        />
      ))}
    </Box>
  );
}

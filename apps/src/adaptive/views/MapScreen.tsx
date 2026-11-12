// The map screen: a bar with the pathway's title, and under it the labs'
// resource rail, the checkpoint map and a side panel that shows the project
// card, or the focused checkpoint's card.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {LevelProperties} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {sendAdaptiveEvent} from '../metricsHelpers';
import {CheckpointStatusMap} from '../progress';
import {usePathwayProject} from '../project/usePathwayProject';
import {PathwayEvidence} from '../routing/evidence';
import {Pathway} from '../types';

import CheckpointCard from './CheckpointCard';
import {resolveMapSettings} from './map/mapSettings';
import MapView from './map/MapView';
import MapZoom from './map/MapZoom';

import styles from './mapScreen.module.scss';

/* eslint-disable import/order */
import '@cdo/apps/sharedComponents/productTour/shepherd.scss';
import type {Tour} from 'shepherd.js';
import {createTourWithSteps} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {
  buildSkillMapTourSteps,
  getSkillMapTourStepIndices,
  SKILL_MAP_TOUR_STORAGE_KEY,
} from './skillMapTourHelpers';
import {tryGetLocalStorage} from '@cdo/apps/utils';
import DCDO from '@cdo/apps/dcdo';
/* eslint-enable import/order */

// Percentages of the size at which the whole map fits.
const ZOOM_PERCENTAGES = [100, 150, 200, 300];

interface MapScreenProps {
  pathway: Pathway;
  /** The adaptive level's own properties, which the resource rail reads. */
  levelProperties: LevelProperties;
  statusMap: CheckpointStatusMap;
  /** What the student has shown, for explaining a skipped checkpoint. */
  evidence: PathwayEvidence;
  /** Checkpoint the map is zoomed onto, if any. */
  focusId?: string;
  onFocus: (id: string | undefined) => void;
  onStart: (checkpointId: string) => void;
  hasSkippedCheckpoints: boolean;
}

const MapScreen: React.FunctionComponent<MapScreenProps> = ({
  pathway,
  levelProperties,
  statusMap,
  evidence,
  focusId,
  onFocus,
  onStart,
  hasSkippedCheckpoints,
}) => {
  const themeSetting = useThemeSetting('adaptive');
  // Load the project channel into Redux so PathwayApp can read its name for
  // the tab label. The manager lives only while the map shows, so it never
  // races a step's manager on the same channel.
  usePathwayProject(pathway);

  // During the tour, show CheckpointCard for the user-selected checkpoint
  // without zooming the map. A zoomed map shifts the highlighted node away from
  // where Shepherd measured it, so we keep the map at its fit view.
  const [tourCheckpointId, setTourCheckpointId] = useState<
    string | undefined
  >();
  // Tracks the active tour step so onSelect knows when to intercept map clicks.
  const [tourStep, setTourStep] = useState(0);
  const tourStepRef = useRef(0);

  const effectiveFocusId = tourCheckpointId ?? focusId;
  const focused = effectiveFocusId
    ? pathway.checkpoints.find(c => c.id === effectiveFocusId)
    : undefined;
  const mapSettings = useMemo(
    () => resolveMapSettings(pathway, window.location.search),
    [pathway]
  );

  const tourEnded = useRef(false);
  const tourRef = useRef<Tour | null>(null);
  // Set to true as soon as the user clicks a checkpoint during step 2 so the
  // step-3 show handler skips the fallback auto-selection.
  const userSelectedCheckpointRef = useRef(false);

  const [tourEnabled, setTourEnabled] = useState(
    () =>
      !!DCDO.get('adaptive-skill-map-tour-enabled', true) &&
      !tryGetLocalStorage(SKILL_MAP_TOUR_STORAGE_KEY, '0')
  );

  const tourStepIndices = useMemo(
    () => getSkillMapTourStepIndices(hasSkippedCheckpoints),
    [hasSkippedCheckpoints]
  );

  const dismissTour = () => {
    if (!tourEnded.current) {
      tourEnded.current = true;
      if (tourStepRef.current >= tourStepIndices.sidebar)
        sendAdaptiveEvent(EVENTS.ADAPTIVE_PRODUCT_TOUR_COMPLETED);
      else
        sendAdaptiveEvent(EVENTS.ADAPTIVE_PRODUCT_TOUR_DISMISSED, {
          stepIndex: tourStepRef.current,
        });
      localStorage.setItem(SKILL_MAP_TOUR_STORAGE_KEY, '1');
      setTourEnabled(false);
      setTourCheckpointId(undefined);
      document.body.classList.remove('adaptive-tour-step-select');
      // Shepherd's _done() restores its own focusedElBeforeOpen (usually body)
      // synchronously after firing the cancel/complete event. Deferring past
      // that tick puts focus on a meaningful map element instead.
      setTimeout(() => {
        document.getElementById('adaptive-tour-first-checkpoint')?.focus();
      }, 0);
    }
  };

  // Keep a ref so the tour event handlers always call the latest dismissTour
  // without needing to be recreated when React state changes.
  const dismissTourRef = useRef(dismissTour);
  dismissTourRef.current = dismissTour;

  useEffect(() => {
    if (!tourEnabled) return;

    const indices = getSkillMapTourStepIndices(hasSkippedCheckpoints);
    const tour = createTourWithSteps(
      t => buildSkillMapTourSteps(t, hasSkippedCheckpoints),
      {scrollTo: false, cancelIcon: {enabled: false}}
    );

    tour.on('show', () => {
      const idx = tour.steps.indexOf(tour.currentStep!);
      tourStepRef.current = idx;
      setTourStep(idx);
      document.body.classList.toggle(
        'adaptive-tour-step-select',
        idx === indices.pickCheckpoint
      );
      // Shepherd opens <dialog open> without showModal(), so the browser's
      // native focus trap is inactive. aria-modal tells NVDA/VoiceOver to
      // treat background content as inert during virtual-cursor navigation.
      tour.currentStep?.el?.setAttribute('aria-modal', 'true');
      // If the user advances to the sidebar step without having clicked a
      // checkpoint (edge case: future keyboard shortcut, test harness, etc.),
      // auto-select the first available one so the sidebar is not empty.
      if (idx === indices.sidebar && !userSelectedCheckpointRef.current) {
        const first = pathway.checkpoints.find(
          c => statusMap[c.id] === 'available'
        );
        if (first) setTourCheckpointId(first.id);
      }
    });

    tour.on('cancel', () => dismissTourRef.current());
    tour.on('complete', () => dismissTourRef.current());

    tourRef.current = tour;
    tour.start();
    sendAdaptiveEvent(EVENTS.ADAPTIVE_PRODUCT_TOUR_STARTED, {
      hasSkippedCheckpoints,
    });

    return () => {
      if (tour.isActive()) tour.cancel();
      tourRef.current = null;
      document.body.classList.remove('adaptive-tour-step-select');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tourFocusIds = useMemo(() => {
    if (!tourEnabled || tourStep !== tourStepIndices.pickCheckpoint)
      return undefined;
    const open = pathway.checkpoints
      .filter(c => statusMap[c.id] !== 'locked')
      .map(c => c.id);
    return open.length > 0 ? open : undefined;
  }, [
    tourEnabled,
    tourStep,
    tourStepIndices.pickCheckpoint,
    pathway.checkpoints,
    statusMap,
  ]);

  // A click on the map background while zoomed returns to the full map.
  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (focusId && !(e.target as HTMLElement).closest('button')) {
      onFocus(undefined);
    }
  };

  return (
    <div className={styles.mapScreen}>
      <div className={styles.mapBody}>
        <ResourcePanel
          levelProperties={levelProperties}
          hasRun={false}
          hasEdited={false}
          isRunning={false}
          // Only the rail shows, so the state above does not matter.
          sidebarOnly
          settings={[themeSetting]}
        />
        <div
          id="adaptive-tour-map"
          className={styles.mapArea}
          onClick={onMapClick}
        >
          {focusId && (
            <MuiButton
              variant="outlined"
              size="small"
              className={styles.mapBack}
              onClick={() => onFocus(undefined)}
            >
              <FontAwesomeV6Icon iconName="map" />
              &nbsp;Back to map
            </MuiButton>
          )}
          <MapZoom
            zoomPercentages={ZOOM_PERCENTAGES}
            startLevel={0}
            fit="whole"
            // A viewer's zoom would move nodes out from under the tour's spotlight.
            disabled={!!focusId || tourEnabled}
            controlsClassName={styles.mapZoom}
          >
            <MapView
              pathway={pathway}
              statusMap={statusMap}
              settings={mapSettings}
              focusId={tourEnabled ? undefined : focusId}
              tourFocusIds={tourFocusIds}
              onSelect={id => {
                const sendSelected = () =>
                  sendAdaptiveEvent(
                    EVENTS.ADAPTIVE_SKILL_MAP_CHECKPOINT_SELECTED,
                    {checkpointId: id, status: statusMap[id]}
                  );
                if (
                  tourEnabled &&
                  tourStep === tourStepIndices.pickCheckpoint
                ) {
                  if (statusMap[id] !== 'locked') {
                    sendSelected();
                    setTourCheckpointId(id);
                    userSelectedCheckpointRef.current = true;
                    tourRef.current?.next();
                  }
                } else if (id === focusId) {
                  onFocus(undefined);
                } else {
                  sendSelected();
                  onFocus(id);
                }
              }}
            />
          </MapZoom>
        </div>
        <aside
          id="adaptive-tour-side"
          aria-label="Checkpoint details"
          className={`${styles.side}${
            focused ? '' : ` ${styles.sideNoSelection}`
          }`}
        >
          {focused ? (
            <CheckpointCard
              pathway={pathway}
              checkpoint={focused}
              status={statusMap[focused.id]}
              statusMap={statusMap}
              evidence={evidence}
              onStart={() => {
                if (tourEnabled) tourRef.current?.complete();
                onStart(focused.id);
              }}
              onSelectCheckpoint={onFocus}
            />
          ) : (
            <div className={styles.sideEmptyPrompt}>
              <MuiTypography variant="body2" className={styles.sideEmptyText}>
                Select a checkpoint
              </MuiTypography>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default MapScreen;

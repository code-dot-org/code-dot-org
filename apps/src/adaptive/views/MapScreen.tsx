// The map screen: a bar with the pathway's title, and under it the labs'
// resource rail, the checkpoint map and a side panel that shows the project
// card, or the focused checkpoint's card.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useMemo, useRef, useState} from 'react';

import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {LevelProperties} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';

import {CheckpointStatusMap} from '../progress';
import {usePathwayProject} from '../project/usePathwayProject';
import {PathwayEvidence} from '../routing/evidence';
import {Pathway} from '../types';

import CheckpointCard from './CheckpointCard';
import {resolveMapSettings} from './map/mapSettings';
import MapView from './map/MapView';
import MapZoom from './map/MapZoom';

import styles from './mapScreen.module.scss';

// Product tour — base library CSS first, then our theme overrides (must follow).
/* eslint-disable import/order */
import 'intro.js/introjs.css';
import './skillMapTourOverrides.scss';
import {Steps} from 'intro.js-react';
import {
  buildSkillMapTourSteps,
  getSkillMapTourStepIndices,
  SKILL_MAP_TOUR_INITIAL_STEP,
  SKILL_MAP_TOUR_STORAGE_KEY,
} from './skillMapTourHelpers';
import {tryGetLocalStorage} from '@cdo/apps/utils';
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
  // where IntroJS measured it, so we keep the map at its fit view.
  const [tourCheckpointId, setTourCheckpointId] = useState<
    string | undefined
  >();
  // Tracks the active tour step so onSelect knows when to intercept map clicks.
  const [tourStep, setTourStep] = useState(0);
  const effectiveFocusId = tourCheckpointId ?? focusId;
  const focused = effectiveFocusId
    ? pathway.checkpoints.find(c => c.id === effectiveFocusId)
    : undefined;
  const mapSettings = useMemo(
    () => resolveMapSettings(pathway, window.location.search),
    [pathway]
  );

  const [tourEnabled, setTourEnabled] = useState(
    () => !tryGetLocalStorage(SKILL_MAP_TOUR_STORAGE_KEY, '0')
  );

  const tourSteps = useMemo(
    () => buildSkillMapTourSteps(hasSkippedCheckpoints),
    [hasSkippedCheckpoints]
  );
  const tourStepIndices = useMemo(
    () => getSkillMapTourStepIndices(hasSkippedCheckpoints),
    [hasSkippedCheckpoints]
  );

  const dismissTour = () => {
    localStorage.setItem(SKILL_MAP_TOUR_STORAGE_KEY, '1');
    setTourEnabled(false);
    setTourCheckpointId(undefined);
    document.body.classList.remove(
      'adaptive-tour-step-select',
      'adaptive-tour-no-next'
    );
  };

  // During the "pick" step, zoom to the centroid of all open checkpoints.
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

  const stepsRef = useRef<Steps | null>(null);

  // A click on the map background while zoomed returns to the full map.
  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (focusId && !(e.target as HTMLElement).closest('button')) {
      onFocus(undefined);
    }
  };

  return (
    <div className={styles.mapScreen}>
      <Steps
        ref={stepsRef}
        enabled={tourEnabled}
        initialStep={SKILL_MAP_TOUR_INITIAL_STEP}
        steps={tourSteps}
        onExit={dismissTour}
        onComplete={dismissTour}
        onChange={(stepIndex: number) => {
          setTourStep(stepIndex);
          document.body.classList.toggle(
            'adaptive-tour-step-select',
            stepIndex === tourStepIndices.pickCheckpoint
          );
          // On the sidebar step and beyond, the user ends the tour by clicking
          // Start — hide the Next/Done button so there's only one path forward.
          document.body.classList.toggle(
            'adaptive-tour-no-next',
            stepIndex >= tourStepIndices.sidebar
          );
          // Going back from the "open checkpoints" step zooms the map out
          // (450ms CSS transition). Re-measure element positions once settled
          // so the spotlight lands on the right node.
          if (stepIndex === tourStepIndices.pickCheckpoint - 1) {
            setTimeout(() => stepsRef.current?.introJs?.refresh(true), 500);
          }
        }}
        onBeforeChange={(nextStepIndex: number) => {
          if (nextStepIndex === 0) {
            setTourCheckpointId(undefined);
          }
        }}
        options={{
          scrollToElement: false,
          exitOnOverlayClick: false,
          nextLabel: 'Got it',
          doneLabel: 'Got it',
          showBullets: false,
          showStepNumbers: false,
        }}
      />
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
                if (
                  tourEnabled &&
                  tourStep === tourStepIndices.pickCheckpoint
                ) {
                  if (statusMap[id] !== 'locked') {
                    setTourCheckpointId(id);
                    stepsRef.current?.introJs?.nextStep();
                  }
                } else {
                  onFocus(id === focusId ? undefined : id);
                }
              }}
            />
          </MapZoom>
        </div>
        <aside
          id="adaptive-tour-side"
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
                if (tourEnabled) dismissTour();
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

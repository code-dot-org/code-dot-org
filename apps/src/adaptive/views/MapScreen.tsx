// The map screen: a bar with the pathway's title, and under it the
// checkpoint map with a side panel that shows the project card, or the
// focused checkpoint's card.

import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useMemo, useState} from 'react';

import {CheckpointStatusMap} from '../progress';
import {usePathwayProject} from '../project/usePathwayProject';
import {PathwayEvidence} from '../routing/evidence';
import {Pathway} from '../types';

import CheckpointCard from './CheckpointCard';
import {resolveMapSettings} from './map/mapSettings';
import MapView from './map/MapView';
import ProjectCard from './ProjectCard';

import styles from './mapScreen.module.scss';

// Product tour — base library CSS first, then our theme overrides (must follow).
/* eslint-disable import/order */
import 'intro.js/introjs.css';
import './skillMapTourOverrides.scss';
import {Steps} from 'intro.js-react';
import {
  buildSkillMapTourSteps,
  SKILL_MAP_TOUR_INITIAL_STEP,
  SKILL_MAP_TOUR_STORAGE_KEY,
} from './skillMapTourHelpers';
/* eslint-enable import/order */

const THEME_ITEMS = [
  {value: 'Light', text: 'Light'},
  {value: 'Dark', text: 'Dark'},
];

interface MapScreenProps {
  pathway: Pathway;
  statusMap: CheckpointStatusMap;
  /** What the student has shown, for explaining a skipped checkpoint. */
  evidence: PathwayEvidence;
  /** Checkpoint the map is zoomed onto, if any. */
  focusId?: string;
  onFocus: (id: string | undefined) => void;
  onStart: (checkpointId: string) => void;
  onWorkOnProject: () => void;
  /** True on the student's first visit (no step progress recorded yet). */
  isFirstVisit: boolean;
  /** True when at least one checkpoint has been skipped by the router. */
  hasSkippedCheckpoints: boolean;
}

const MapScreen: React.FunctionComponent<MapScreenProps> = ({
  pathway,
  statusMap,
  evidence,
  focusId,
  onFocus,
  onStart,
  onWorkOnProject,
  isFirstVisit,
  hasSkippedCheckpoints,
}) => {
  const {theme, setTheme} = useTheme();
  // The project manager lives only while the map shows, so it never races a
  // step's manager on the same channel.
  const projectState = usePathwayProject(pathway);
  const focused = focusId && pathway.checkpoints.find(c => c.id === focusId);
  const mapSettings = useMemo(
    () => resolveMapSettings(pathway, window.location.search),
    [pathway]
  );

  const [tourEnabled, setTourEnabled] = useState(
    () => isFirstVisit && !localStorage.getItem(SKILL_MAP_TOUR_STORAGE_KEY)
  );

  const tourSteps = useMemo(
    () => buildSkillMapTourSteps(hasSkippedCheckpoints),
    [hasSkippedCheckpoints]
  );

  const dismissTour = () => {
    localStorage.setItem(SKILL_MAP_TOUR_STORAGE_KEY, '1');
    setTourEnabled(false);
  };

  // A click on the map background while zoomed returns to the full map.
  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (focusId && !(e.target as HTMLElement).closest('button')) {
      onFocus(undefined);
    }
  };

  return (
    <div className={styles.mapScreen}>
      <Steps
        enabled={tourEnabled}
        initialStep={SKILL_MAP_TOUR_INITIAL_STEP}
        steps={tourSteps}
        onExit={dismissTour}
        onComplete={dismissTour}
        options={{
          scrollToElement: false,
          exitOnOverlayClick: false,
          hidePrev: true,
          nextLabel: 'Next',
          doneLabel: 'Done',
          showBullets: false,
          showStepNumbers: true,
        }}
      />
      <header className={styles.mapBar}>
        <MuiTypography variant="strong">{pathway.title}</MuiTypography>
      </header>
      <div className={styles.mapBody}>
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
          <MapView
            pathway={pathway}
            statusMap={statusMap}
            settings={mapSettings}
            focusId={focusId}
            onSelect={id => onFocus(id === focusId ? undefined : id)}
          />
        </div>
        <aside id="adaptive-tour-side" className={styles.side}>
          {focused ? (
            <CheckpointCard
              pathway={pathway}
              checkpoint={focused}
              status={statusMap[focused.id]}
              statusMap={statusMap}
              evidence={evidence}
              onStart={() => onStart(focused.id)}
              onSelectCheckpoint={onFocus}
            />
          ) : (
            <ProjectCard
              pathway={pathway}
              {...projectState}
              onWorkOnProject={onWorkOnProject}
            />
          )}
          <div className={styles.sideFooter}>
            <SimpleDropdown
              name="adaptive-theme"
              labelText="Theme"
              isLabelVisible={false}
              items={THEME_ITEMS}
              selectedValue={theme}
              onChange={e => setTheme(e.target.value as Theme)}
              size="s"
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MapScreen;

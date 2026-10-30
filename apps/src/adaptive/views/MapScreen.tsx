// The map screen: a bar with the pathway's title, and under it the
// checkpoint map with a side panel that shows the project card, or the
// focused checkpoint's card.

import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useMemo} from 'react';

import {CheckpointStatusMap} from '../progress';
import {usePathwayProject} from '../project/usePathwayProject';
import {PathwayEvidence} from '../routing/evidence';
import {Pathway} from '../types';

import CheckpointCard from './CheckpointCard';
import {resolveMapSettings} from './map/mapSettings';
import MapView from './map/MapView';
import MapZoom from './map/MapZoom';
import ProjectCard from './ProjectCard';

import styles from './mapScreen.module.scss';

// Multiples of the size at which the whole map fits.
const ZOOM_LEVELS = [1, 1.5, 2, 3];

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
}

const MapScreen: React.FunctionComponent<MapScreenProps> = ({
  pathway,
  statusMap,
  evidence,
  focusId,
  onFocus,
  onStart,
  onWorkOnProject,
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

  // A click on the map background while zoomed returns to the full map.
  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (focusId && !(e.target as HTMLElement).closest('button')) {
      onFocus(undefined);
    }
  };

  return (
    <div className={styles.mapScreen}>
      <header className={styles.mapBar}>
        <MuiTypography variant="strong">{pathway.title}</MuiTypography>
      </header>
      <div className={styles.mapBody}>
        <div className={styles.mapArea} onClick={onMapClick}>
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
          {/* The checkpoint zoom assumes an unzoomed, unscrolled map. */}
          <MapZoom
            levels={ZOOM_LEVELS}
            startLevel={0}
            fit="whole"
            disabled={!!focusId}
            controlsClassName={styles.mapZoom}
          >
            <MapView
              pathway={pathway}
              statusMap={statusMap}
              settings={mapSettings}
              focusId={focusId}
              onSelect={id => onFocus(id === focusId ? undefined : id)}
            />
          </MapZoom>
        </div>
        <aside className={styles.side}>
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

// The map screen: the checkpoint map with a side panel that shows the
// project card, or the focused checkpoint's card.

import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {CheckpointStatusMap} from '../progress';
import {usePathwayProject} from '../project/usePathwayProject';
import {Pathway} from '../types';

import CheckpointCard from './CheckpointCard';
import MapView from './MapView';
import ProjectCard from './ProjectCard';

import styles from './mapScreen.module.scss';
import shared from './shared.module.scss';

const THEME_ITEMS = [
  {value: 'Light', text: 'Light'},
  {value: 'Dark', text: 'Dark'},
];

interface MapScreenProps {
  pathway: Pathway;
  statusMap: CheckpointStatusMap;
  /** Checkpoint the map is zoomed onto, if any. */
  focusId?: string;
  onFocus: (id: string | undefined) => void;
  onStart: (checkpointId: string) => void;
  onWorkOnProject: () => void;
  onReset: () => void;
}

const MapScreen: React.FunctionComponent<MapScreenProps> = ({
  pathway,
  statusMap,
  focusId,
  onFocus,
  onStart,
  onWorkOnProject,
  onReset,
}) => {
  const {theme, setTheme} = useTheme();
  // The project manager lives only while the map shows, so it never races a
  // step's manager on the same channel.
  const projectState = usePathwayProject(pathway);
  const focused = focusId && pathway.checkpoints.find(c => c.id === focusId);

  // A click on the map background while zoomed returns to the full map.
  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (focusId && !(e.target as HTMLElement).closest('button')) {
      onFocus(undefined);
    }
  };

  return (
    <div className={styles.mapScreen}>
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
        <header
          className={classNames(
            styles.mapHeader,
            focusId && styles.mapHeaderHidden
          )}
          aria-hidden={!!focusId}
        >
          <MuiTypography variant="overline1">Adaptive pathway</MuiTypography>
          <MuiTypography variant="h2">{pathway.title}</MuiTypography>
          <MuiTypography variant="body3" className={shared.muted}>
            {pathway.objective}
          </MuiTypography>
        </header>
        <MapView
          pathway={pathway}
          statusMap={statusMap}
          focusId={focusId}
          onSelect={id => onFocus(id === focusId ? undefined : id)}
        />
      </div>
      <aside className={styles.side}>
        {focused ? (
          <CheckpointCard
            pathway={pathway}
            checkpoint={focused}
            status={statusMap[focused.id]}
            statusMap={statusMap}
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
          <MuiButton
            variant="outlined"
            size="small"
            className={styles.resetButton}
            onClick={onReset}
          >
            <FontAwesomeV6Icon iconName="rotate-right" />
            &nbsp;Reset progress
          </MuiButton>
        </div>
      </aside>
    </div>
  );
};

export default MapScreen;

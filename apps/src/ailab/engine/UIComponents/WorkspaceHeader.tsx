/* Header row across the top of the lab's workspace. */

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Button, Tooltip, Typography} from '@mui/material';
import React from 'react';

import {isPanelEnabled} from '../helpers/navigationValidation';
import {useAppDispatch, useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {
  getHideDatasetView,
  getHideTestingView,
  setCurrentPanel,
} from '../redux';

import styles from './workspaceHeader.module.scss';

const TABS = [
  {panel: 'datasetView', label: 'Dataset', iconName: 'table'},
  {panel: 'results', label: 'Testing', iconName: 'flask'},
] as const;

interface WorkspaceHeaderProps {
  onStartOver?: () => void;
}

const WorkspaceHeader = ({onStartOver}: WorkspaceHeaderProps) => {
  const dispatch = useAppDispatch();
  const currentPanel = useAppSelector(state => state.currentPanel);
  const showsOneView = useAppSelector(
    state => getHideDatasetView(state) || getHideTestingView(state)
  );
  const {project} = useProject();
  const canTest = useAppSelector(state =>
    isPanelEnabled(state, project, 'results')
  );
  const openTab = TABS.find(tab => tab.panel === currentPanel);

  const onTabChange = (value: string) => {
    const tab = TABS.find(({panel}) => panel === value);
    if (tab && tab !== openTab) {
      dispatch(setCurrentPanel(tab.panel));
    }
  };

  return (
    <div className={styles.header}>
      {openTab && !showsOneView && (
        <Tooltip
          title={
            canTest ? undefined : 'Train the model on these columns to test it'
          }
          describeChild
        >
          <div role="group" aria-label="Workspace view" className={styles.tabs}>
            <SegmentedButtons
              size="xs"
              selectedButtonValue={openTab.panel}
              onChange={onTabChange}
              buttons={TABS.map(tab => ({
                value: tab.panel,
                label: tab.label,
                iconLeft: {iconName: tab.iconName, iconStyle: 'solid'},
                disabled: tab.panel === 'results' && !canTest,
              }))}
            />
          </div>
        </Tooltip>
      )}
      <Typography component="h2" variant="overline2" className={styles.title}>
        Workspace
      </Typography>
      {onStartOver && (
        <Button
          variant="outlined"
          color="secondary"
          size="extraSmall"
          startIcon={
            <FontAwesomeV6Icon iconName="rotate-left" aria-hidden="true" />
          }
          onClick={onStartOver}
          className={styles.startOver}
        >
          Start over
        </Button>
      )}
    </div>
  );
};

export default WorkspaceHeader;

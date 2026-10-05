/* Header row across the top of the lab's workspace. */
import {Typography} from '@mui/material';

import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';

import {
  isPanelEnabled,
  isTrainedOnCurrentColumns,
} from '../helpers/navigationValidation';
import {useAppDispatch, useAppSelector} from '../hooks';
import {setCurrentPanel} from '../redux';
import type {Panel} from '../types';

import styles from './workspaceHeader.module.scss';

const TAB_PANELS: Panel[] = ['datasetView', 'results'];

const WorkspaceHeader = () => {
  const dispatch = useAppDispatch();
  const currentPanel = useAppSelector(state => state.currentPanel);
  const canTest = useAppSelector(
    state =>
      isPanelEnabled(state, 'results') && isTrainedOnCurrentColumns(state),
  );

  // Entering results clears the prediction, so ignore a click on the open tab.
  const onTabChange = (panel: string) => {
    if (panel !== currentPanel) {
      dispatch(setCurrentPanel(panel as Panel));
    }
  };

  return (
    <div className={styles.header}>
      {TAB_PANELS.includes(currentPanel) && (
        <SegmentedButtons
          className={styles.tabs}
          size="xs"
          selectedButtonValue={currentPanel}
          onChange={onTabChange}
          buttons={[
            {
              value: 'datasetView',
              label: 'Dataset',
              iconLeft: {iconName: 'table', iconStyle: 'solid'},
            },
            {
              value: 'results',
              label: 'Testing',
              iconLeft: {iconName: 'flask', iconStyle: 'solid'},
              disabled: !canTest,
            },
          ]}
        />
      )}
      <Typography component="h2" variant="overline2" className={styles.title}>
        Workspace
      </Typography>
    </div>
  );
};

export default WorkspaceHeader;

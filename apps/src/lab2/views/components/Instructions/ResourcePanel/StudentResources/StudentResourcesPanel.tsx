import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import {KeyboardShortcutCategories} from '@cdo/apps/lab2/keyboardShortcuts/types';
import {ProductTourConfig} from '@cdo/apps/lab2/productTours/productToursPerLab';

import GuidedWalkthroughs from './GuidedWalkthroughs';

import styles from './student-resources-panel.module.scss';

interface StudentResourcesPanelProps {
  levelTours: ProductTourConfig[];
  otherAvailableTours: ProductTourConfig[];
  shortcuts?: KeyboardShortcutCategories;
}

const StudentResourcesPanel: React.FC<StudentResourcesPanelProps> = ({
  levelTours,
  otherAvailableTours,
  shortcuts,
}) => {
  const hasTours = levelTours.length > 0 || otherAvailableTours.length > 0;
  const hasShortcuts = !!shortcuts && Object.keys(shortcuts).length > 0;
  return (
    <div className={styles.panel}>
      {hasTours && (
        <GuidedWalkthroughs
          levelTours={levelTours}
          otherAvailableTours={otherAvailableTours}
        />
      )}
      {hasShortcuts && (
        <div>
          <Typography variant="body3" className={styles.shortcutsHintHeading}>
            <FontAwesomeV6Icon iconName="keyboard" />
            <strong>Keyboard shortcuts</strong>
          </Typography>
          <Typography variant="body4">
            Press <kbd className={styles.shortcutsHintKey}>/</kbd> to see
            available shortcuts in this lab.
          </Typography>
        </div>
      )}
    </div>
  );
};

export default StudentResourcesPanel;

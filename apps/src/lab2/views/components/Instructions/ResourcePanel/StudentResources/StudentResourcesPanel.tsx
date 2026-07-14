import React from 'react';

import {ProductTourConfig} from '@cdo/apps/lab2/productTours/productToursPerLab';

import GuidedWalkthroughs from './GuidedWalkthroughs';
import KeyboardShortcuts, {
  KeyboardShortcutCategories,
} from './KeyboardShortcuts';

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
      {hasShortcuts && <KeyboardShortcuts shortcuts={shortcuts} />}
    </div>
  );
};

export default StudentResourcesPanel;

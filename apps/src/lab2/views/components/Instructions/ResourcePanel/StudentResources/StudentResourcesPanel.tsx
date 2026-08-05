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

  const sections: {key: string; node: React.ReactNode}[] = [];
  if (hasTours) {
    sections.push({
      key: 'walkthroughs',
      node: (
        <GuidedWalkthroughs
          levelTours={levelTours}
          otherAvailableTours={otherAvailableTours}
        />
      ),
    });
  }
  if (hasShortcuts) {
    sections.push({
      key: 'shortcuts',
      node: (
        <div>
          <Typography variant="body3" className={styles.shortcutsHintHeading}>
            <strong>Keyboard shortcuts</strong>
          </Typography>
          <Typography variant="body4">
            Press <kbd className={styles.shortcutsHintKey}>/</kbd> to see
            available shortcuts in this lab.
          </Typography>
        </div>
      ),
    });
  }

  return (
    <div className={styles.panel}>
      {sections.map(({key, node}, index) => (
        <div
          key={key}
          className={
            index < sections.length - 1 ? styles.sectionDivider : undefined
          }
        >
          {node}
        </div>
      ))}
    </div>
  );
};

export default StudentResourcesPanel;

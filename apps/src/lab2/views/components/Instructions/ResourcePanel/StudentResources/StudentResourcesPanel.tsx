import React from 'react';

import {ProductTourConfig} from '@cdo/apps/lab2/productTours/productToursPerLab';

import GuidedWalkthroughs from './GuidedWalkthroughs';

import styles from './student-resources-panel.module.scss';

interface StudentResourcesPanelProps {
  levelTours: ProductTourConfig[];
  otherAvailableTours: ProductTourConfig[];
}

const StudentResourcesPanel: React.FC<StudentResourcesPanelProps> = ({
  levelTours,
  otherAvailableTours,
}) => {
  return (
    <div className={styles.panel}>
      <GuidedWalkthroughs
        levelTours={levelTours}
        otherAvailableTours={otherAvailableTours}
      />
    </div>
  );
};

export default StudentResourcesPanel;

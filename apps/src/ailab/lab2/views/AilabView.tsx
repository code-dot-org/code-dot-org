import React from 'react';

import {LabProps} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';

import {AilabLevelProperties} from '../types';

import styles from './ailab-view.module.scss';

const AilabView: React.FC<LabProps<AilabLevelProperties>> = ({
  levelProperties,
}) => {
  return (
    <div id="ailab-lab2" className={styles.ailab} data-notranslate>
      <ResourcePanel
        className={styles.resourcePanel}
        levelProperties={levelProperties}
        isRunning={false}
        hasRun={false}
        hasEdited={false}
      />
      <div className={styles.divider} />
      <div className={styles.workspace}>
        <div id="root" className={styles.root}>
          AI Lab on Lab2: Coming Soon!
          <pre>{JSON.stringify(levelProperties, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default AilabView;

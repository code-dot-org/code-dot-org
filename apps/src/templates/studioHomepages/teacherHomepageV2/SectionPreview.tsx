import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import AccountTypesPreview from './previews/AccountTypesPreview';
import LessonMaterialsPreview from './previews/LessonMaterialsPreview';
import ProgressPreview from './previews/ProgressPreview';

import styles from './sectionPreview.module.scss';

type PreviewTab = 'progress' | 'lessonMaterials' | 'accountTypes';

interface TabConfig {
  key: PreviewTab;
  label: string;
  component: React.FC;
}

const TABS: TabConfig[] = [
  {key: 'progress', label: 'Progress', component: ProgressPreview},
  {
    key: 'lessonMaterials',
    label: 'Lesson Materials',
    component: LessonMaterialsPreview,
  },
  {key: 'accountTypes', label: 'Account Types', component: AccountTypesPreview},
];

const SectionPreview: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<PreviewTab>('progress');

  const ActiveComponent =
    TABS.find(tab => tab.key === selectedTab)?.component || ProgressPreview;

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewHeader}>
        <Typography variant="h4">
          Create a section to unlock the full power of your teacher homepage!
        </Typography>
      </div>
      <div className={styles.previewBody}>
        <div className={styles.previewSidebar}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={classNames(styles.previewSidebarOption, {
                [styles.selected]: selectedTab === tab.key,
              })}
              onClick={() => setSelectedTab(tab.key)}
            >
              <Typography
                variant="body2"
                fontWeight={selectedTab === tab.key ? 600 : 400}
              >
                {tab.label}
              </Typography>
            </button>
          ))}
        </div>
        <div className={styles.previewContent}>
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default SectionPreview;

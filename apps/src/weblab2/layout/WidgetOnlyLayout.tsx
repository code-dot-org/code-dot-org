// A widget level: the resource panel's rail, then the site alone, sized to
// the view with a margin around it like a panels or video level, and the
// lesson's Continue under it on the right. No tabs, no workspace, no preview
// header.

import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {useCodebridgeSettings} from '@codebridge/hooks/useCodebridgeSettings';
import React from 'react';

import NavigationArea from '@cdo/apps/lab2/views/components/Instructions/NavigationArea';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {HTMLPreview} from '@cdo/apps/weblab2/htmlPreview/HTMLPreview';

import styles from './widget-only-layout.module.scss';

const WidgetOnlyLayout: React.FunctionComponent = () => {
  const {levelProperties} = useCodebridgeContext();
  const settings = useCodebridgeSettings();
  const isRunning = useAppSelector(state => state.lab2System.isRunning);
  const hasRun = useAppSelector(state => state.lab2System.hasRun);
  const hasEdited = useAppSelector(state => state.lab2Project.hasEdited);

  return (
    <div className={styles.container}>
      <ResourcePanel
        levelProperties={levelProperties}
        hasRun={false}
        hasEdited={false}
        isRunning={false}
        // Sidebar only, so the above fields don't matter
        sidebarOnly
        settings={settings}
        className={styles.sidebar}
      />
      <div className={styles.content}>
        <div className={styles.preview}>
          <HTMLPreview />
        </div>
        <div className={styles.controls}>
          <NavigationArea
            levelProperties={levelProperties}
            isRunning={isRunning}
            hasRun={hasRun}
            hasEdited={hasEdited}
            textVariant="simple"
            continueButtonSize="medium"
          />
        </div>
      </div>
    </div>
  );
};

export default WidgetOnlyLayout;

import {Button} from '@code-dot-org/component-library/button';
import React, {FC} from 'react';
import {Outlet, useLocation} from 'react-router-dom';

import {FacilitatorSelection} from './components/FacilitatorSelection';
import {SurveyCategorySelection} from './components/SurveyCategorySelection';
import {SurveyTypeSelection} from './components/SurveyTypeSelection';
import {WorkshopTabs} from './components/WorkshopTabs';
import {WorkshopProvider} from './context/WorkshopContext';
import {WorkshopLayoutProps} from './types';

import styles from './workshop.module.scss';

export const WorkshopLayout: FC<WorkshopLayoutProps> = ({
  tabList,
  surveyTypeOptions,
  questionCategoryButtons,
}) => {
  const {pathname} = useLocation();

  const showTabs = !pathname.includes('/edit');
  const showSurveyElements = pathname.includes('/surveys');
  const showPostSurveyCategorySelection = pathname.includes('/surveys/post');
  const showFacilitatorSelection = pathname.includes(
    '/surveys/post/facilitators'
  );

  // TODO: https://codedotorg.atlassian.net/browse/ACQ-3438
  const handleDownload = () => {};

  return (
    <WorkshopProvider>
      <nav aria-label="Workshop sections" className={styles.navContainer}>
        {showTabs && <WorkshopTabs tabList={tabList} />}
        <div className={styles.navRow}>
          {showSurveyElements && (
            <SurveyTypeSelection surveyTypeOptions={surveyTypeOptions} />
          )}
          {showPostSurveyCategorySelection && (
            <>
              <div className={styles.divider} />
              <SurveyCategorySelection
                questionCategoryButtons={questionCategoryButtons}
              />
            </>
          )}
          {showSurveyElements && (
            <Button
              className={styles.exportButton}
              iconLeft={{iconName: 'download'}}
              onClick={handleDownload}
              text="Export survey results"
              size="s"
            />
          )}
        </div>
        {showFacilitatorSelection && <FacilitatorSelection />}
      </nav>
      <main>
        <Outlet />
      </main>
    </WorkshopProvider>
  );
};

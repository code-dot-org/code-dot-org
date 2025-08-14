import {Button} from '@code-dot-org/component-library/button';
import React, {FC, useMemo} from 'react';
import {Outlet, useLocation, useParams} from 'react-router-dom';

import {useFetch} from '@cdo/apps/util/useFetch';

import {Workshop} from '../WorkshopFormTemplate/types';
import {workshopDataToOverviewProps} from '../WorkshopFormTemplate/utils';

import {FacilitatorSelection} from './components/FacilitatorSelection';
import {SurveyCategorySelection} from './components/SurveyCategorySelection';
import {SurveyTypeSelection} from './components/SurveyTypeSelection';
import {WorkshopTabs} from './components/WorkshopTabs';
import {WorkshopLayoutProps} from './types';

import styles from './workshop.module.scss';

export const WorkshopLayout: FC<WorkshopLayoutProps> = ({
  tabList,
  surveyTypeOptions,
  questionCategoryButtons,
}) => {
  const {pathname} = useLocation();
  const {workshopId} = useParams<{workshopId: string}>();

  const {data, loading, error, refetch} = useFetch<Workshop | null>(
    workshopId ? `/api/v1/pd/workshops/${workshopId}` : ''
  );

  const workshop = useMemo(
    () => (data ? workshopDataToOverviewProps(data) : null),
    [data]
  );

  const showTabs = !pathname.includes('/edit');
  const showSurveyElements = pathname.includes('/surveys');
  const showPostSurveyCategorySelection = pathname.includes('/surveys/post');
  const showFacilitatorSelection = pathname.includes(
    '/surveys/post/facilitators'
  );

  // TODO: https://codedotorg.atlassian.net/browse/ACQ-3438
  const handleDownload = () => {};

  return (
    <>
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
        <Outlet context={{workshop, loading, error, refetch}} />
      </main>
    </>
  );
};

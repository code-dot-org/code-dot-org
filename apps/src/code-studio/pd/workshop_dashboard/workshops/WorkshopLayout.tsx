import {Button} from '@code-dot-org/component-library/button';
import React, {FC, useMemo, createContext, useContext} from 'react';
import {Outlet, useLocation, useParams} from 'react-router-dom';

import {useFetch} from '@cdo/apps/util/useFetch';

import {
  Enrollment,
  SurveySummary,
  Workshop,
} from '../WorkshopFormTemplate/types';
import {
  enrollmentDataToProps,
  workshopDataToProps,
} from '../WorkshopFormTemplate/utils';

import {FacilitatorSelection} from './components/FacilitatorSelection';
import {SurveyCategorySelection} from './components/SurveyCategorySelection';
import {SurveyTypeSelection} from './components/SurveyTypeSelection';
import {WorkshopTabs} from './components/WorkshopTabs';
import {NoSurveyResponses} from './surveys/components/NoSurveyResponses';
import {WorkshopLayoutProps, WorkshopContextValue} from './types';

import styles from './workshop.module.scss';

const WorkshopContext = createContext<WorkshopContextValue | undefined>(
  undefined
);

export const useWorkshopContext = (): WorkshopContextValue => {
  const context = useContext(WorkshopContext);
  if (context === undefined) {
    throw new Error('useWorkshopContext must be used within WorkshopLayout');
  }
  return context;
};

export const WorkshopLayout: FC<WorkshopLayoutProps> = ({
  tabList,
  surveyTypeOptions,
  questionCategoryButtons,
}) => {
  const {pathname} = useLocation();
  const {workshopId} = useParams<{workshopId: string}>();

  const {
    data: workshopData,
    loading: workshopLoading,
    error: workshopError,
    refetch: refetchWorkshop,
  } = useFetch<Workshop | null>(
    workshopId ? `/api/v1/pd/workshops/${workshopId}` : ''
  );

  const {
    data: enrollmentData,
    loading: enrollmentsLoading,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useFetch<Enrollment[] | null>(
    workshopId ? `/api/v1/pd/workshops/${workshopId}/enrollments` : ''
  );

  const {
    data: surveys,
    loading: surveysLoading,
    error: surveysError,
    refetch: refetchSurveys,
  } = useFetch<SurveySummary | null>(
    workshopId
      ? `/api/v1/pd/workshops/${workshopId}/foorm/workshop_survey_summary`
      : ''
  );

  const workshop = useMemo(
    () => (workshopData ? workshopDataToProps(workshopData) : null),
    [workshopData]
  );

  const enrollments = useMemo(
    () => (enrollmentData ? enrollmentDataToProps(enrollmentData) : []),
    [enrollmentData]
  );

  const showTabs = !pathname.includes('/edit');
  const showSurveyElements = pathname.includes('/surveys');
  const showPostSurveyCategorySelection = pathname.includes('/surveys/post');
  const showFacilitatorSelection =
    pathname.includes('/surveys/post/facilitators') &&
    surveys?.surveys?.post_workshop;

  const showNoSurveyResponses = useMemo(() => {
    if (showPostSurveyCategorySelection) {
      return !surveysLoading && !surveys?.surveys?.post_workshop;
    }
  }, [
    showPostSurveyCategorySelection,
    surveys?.surveys?.post_workshop,
    surveysLoading,
  ]);

  // TODO: https://codedotorg.atlassian.net/browse/ACQ-3438
  const handleDownload = () => {};

  const contextValue: WorkshopContextValue = {
    workshop,
    workshopLoading,
    workshopError,
    refetchWorkshop,
    enrollments,
    enrollmentsLoading,
    enrollmentsError,
    refetchEnrollments,
    surveys,
    surveysLoading,
    surveysError,
    refetchSurveys,
  };

  return (
    <WorkshopContext.Provider value={contextValue}>
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
        {showFacilitatorSelection && (
          <FacilitatorSelection facilitators={workshop?.facilitators} />
        )}
      </nav>
      <main>
        {showNoSurveyResponses && <NoSurveyResponses />}
        <Outlet />
      </main>
    </WorkshopContext.Provider>
  );
};

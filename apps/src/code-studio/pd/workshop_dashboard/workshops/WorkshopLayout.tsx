import Alert from '@code-dot-org/component-library/alert';
import {Button, LinkButton} from '@code-dot-org/component-library/button';
import React, {
  FC,
  useMemo,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import {Outlet, useLocation, useParams} from 'react-router-dom';

import {CourseBuildYourOwn} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
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
import {Loading} from './components/Loading';
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

  const [defaultLoading, setDefaultLoading] = useState(true);

  // prevent flash of loading indicator on fast connections
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDefaultLoading(false);
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const {
    data: workshopResponse,
    loading: workshopLoading,
    error: workshopError,
    refetch: refetchWorkshop,
  } = useFetch<Workshop | null>(
    workshopId ? `/api/v1/pd/workshops/${workshopId}` : ''
  );

  const {
    data: enrollmentResponse,
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
  } = useFetch<SurveySummary | null>(
    workshopId
      ? `/api/v1/pd/workshops/${workshopId}/foorm/workshop_survey_summary`
      : ''
  );

  const workshop = useMemo(
    () => (workshopResponse ? workshopDataToProps(workshopResponse) : null),
    [workshopResponse]
  );

  const enrollments = useMemo(
    () => (enrollmentResponse ? enrollmentDataToProps(enrollmentResponse) : []),
    [enrollmentResponse]
  );

  const onSurveysPage = pathname.includes('/surveys');
  const onPostSurveyPage = pathname.includes('/surveys/post');
  const onFacilitatorPage = pathname.includes('/surveys/post/facilitators');
  const onEditPage = pathname.includes('/edit');

  const showTabs = !onEditPage;

  const showLegacySurveyLinkButton =
    onSurveysPage && workshop?.course && workshop.course !== CourseBuildYourOwn;

  const showSurveyElements = onSurveysPage && !showLegacySurveyLinkButton;

  const showPostSurveyCategorySelection =
    showSurveyElements && onPostSurveyPage;

  const showFacilitatorSelection =
    showSurveyElements && onFacilitatorPage && surveys?.surveys?.post_workshop;

  const showNoSurveyResponses = useMemo(() => {
    if (showPostSurveyCategorySelection) {
      return !surveysLoading && !surveys?.surveys?.post_workshop;
    }
    return false;
  }, [
    showPostSurveyCategorySelection,
    surveys?.surveys?.post_workshop,
    surveysLoading,
  ]);

  const showLoading = useMemo(() => {
    return (
      defaultLoading ||
      (!workshop && workshopLoading) ||
      (!enrollments && enrollmentsLoading) ||
      (!surveys && surveysLoading)
    );
  }, [
    defaultLoading,
    enrollments,
    enrollmentsLoading,
    surveys,
    surveysLoading,
    workshop,
    workshopLoading,
  ]);

  // TODO: https://codedotorg.atlassian.net/browse/ACQ-3438
  const handleDownload = () => {};

  const contextValue: WorkshopContextValue = {
    workshop,
    refetchWorkshop,
    enrollments,
    enrollmentsLoading,
    refetchEnrollments,
    surveys,
  };

  if (showLoading) {
    return <Loading />;
  }

  if (workshopError || enrollmentsError || surveysError) {
    return (
      <Alert
        size="m"
        text="Something went wrong, please refresh the page."
        type="danger"
      />
    );
  }

  return (
    <WorkshopContext.Provider value={contextValue}>
      <nav aria-label="Workshop sections" className={styles.navContainer}>
        {showTabs && <WorkshopTabs tabList={tabList} />}
        <div className={styles.navRow}>
          {showSurveyElements && (
            <SurveyTypeSelection surveyTypeOptions={surveyTypeOptions} />
          )}
          {showLegacySurveyLinkButton && (
            <LinkButton
              href={`/pd/workshop_dashboard/workshop_daily_survey_results/${workshopId}`}
              text="Survey results"
            />
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

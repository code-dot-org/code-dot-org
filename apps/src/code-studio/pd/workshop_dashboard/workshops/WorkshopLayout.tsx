import Alert from '@code-dot-org/component-library/alert';
import {LinkButton} from '@code-dot-org/component-library/button';
import {SegmentedButtonsProps} from '@code-dot-org/component-library/segmentedButtons';
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
import {useFetch, UseFetchResult} from '@cdo/apps/util/useFetch';

import {FacilitatorSelection} from './components/FacilitatorSelection';
import {Loading} from './components/Loading';
import {SurveyCategorySelection} from './components/SurveyCategorySelection';
import {
  SurveyTypeSelection,
  SurveyTypeSelectionProps,
} from './components/SurveyTypeSelection';
import {WorkshopTabs, WorkshopTabsProps} from './components/WorkshopTabs';
import {ExportSurveysButton} from './surveys/components/ExportSurveysButton';
import {NoSurveyResponses} from './surveys/components/NoSurveyResponses';
import {
  Enrollment,
  EnrollmentData,
  SurveySummary,
  Workshop,
  WorkshopData,
} from './types';
import {enrollmentDataToProps, workshopDataToProps} from './utils';

import styles from './workshop.module.scss';

export type WorkshopLayoutProps = WorkshopTabsProps &
  SurveyTypeSelectionProps & {
    questionCategoryButtons: {
      preWorkshopSurvey: SegmentedButtonsProps['buttons'];
      postWorkshopSurvey: SegmentedButtonsProps['buttons'];
    };
  };

export interface WorkshopContextValue {
  workshop: WorkshopData | null;
  refetchWorkshop: UseFetchResult<Workshop>['refetch'];
  enrollments: EnrollmentData[];
  enrollmentsLoading: UseFetchResult<EnrollmentData[]>['loading'];
  refetchEnrollments: UseFetchResult<EnrollmentData[]>['refetch'];
  surveys: SurveySummary | null;
}

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
    return () => clearTimeout(timeout);
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
  const onPreSurveyPage = pathname.includes('/surveys/pre');
  const onPostSurveyPage = pathname.includes('/surveys/post');
  const onFacilitatorPage = pathname.includes('/surveys/post/facilitators');
  const onEditPage = pathname.includes('/edit');

  const showTabs = !onEditPage;

  const showLegacySurveyLinkButton =
    onSurveysPage && workshop?.course && workshop.course !== CourseBuildYourOwn;

  const showSurveyElements = onSurveysPage && !showLegacySurveyLinkButton;

  const showSurveyCategorySelection =
    showSurveyElements && (onPreSurveyPage || onPostSurveyPage);

  const showFacilitatorSelection =
    showSurveyElements && onFacilitatorPage && surveys?.surveys?.post_workshop;

  const showNoSurveyResponses = useMemo(() => {
    if (onPreSurveyPage) {
      return !surveysLoading && !surveys?.surveys?.pre_workshop;
    } else if (onPostSurveyPage) {
      return !surveysLoading && !surveys?.surveys?.post_workshop;
    }
    return false;
  }, [
    onPreSurveyPage,
    onPostSurveyPage,
    surveys?.surveys?.pre_workshop,
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

  const activeSurveyCategoryButtons = useMemo(() => {
    if (onPreSurveyPage) return questionCategoryButtons.preWorkshopSurvey;
    if (onPostSurveyPage) return questionCategoryButtons.postWorkshopSurvey;
    return [];
  }, [
    onPostSurveyPage,
    onPreSurveyPage,
    questionCategoryButtons.postWorkshopSurvey,
    questionCategoryButtons.preWorkshopSurvey,
  ]);

  const facilitators = useMemo(() => {
    if (!surveys?.facilitators) {
      return [];
    }
    return Object.entries(surveys.facilitators).map(([id, name]) => ({
      id: Number(id),
      name,
      email: '',
    }));
  }, [surveys?.facilitators]);

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

          {showSurveyCategorySelection && (
            <>
              <div className={styles.divider} />
              <SurveyCategorySelection
                questionCategoryButtons={activeSurveyCategoryButtons}
              />
            </>
          )}
          {showSurveyElements && <ExportSurveysButton />}
        </div>
        {showFacilitatorSelection && (
          <FacilitatorSelection facilitators={facilitators} />
        )}
      </nav>
      <main>
        {showLegacySurveyLinkButton ? (
          <LinkButton
            href={`/pd/workshop_dashboard/workshop_daily_survey_results/${workshopId}`}
            text="Survey results"
          />
        ) : (
          <>
            {showNoSurveyResponses && <NoSurveyResponses />}
            <Outlet />
          </>
        )}
      </main>
    </WorkshopContext.Provider>
  );
};

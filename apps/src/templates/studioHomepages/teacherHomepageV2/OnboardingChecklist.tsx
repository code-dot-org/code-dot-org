import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import React from 'react';
import {Tour} from 'shepherd.js';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  createDemoSection,
  DemoSectionCreationError,
} from '../../teacherDashboard/teacherSectionsRedux';
import {
  DemoType,
  Section,
} from '../../teacherDashboard/types/teacherSectionTypes';

import confirmDemoSectionSettings from './confirmDemoSectionSettings';
import DemoSectionStalenessDialog from './DemoSectionStalenessDialog';
import useCreateSectionTour from './useCreateSectionTour';
import useLearnHowToEvaluateTour from './useLearnHowToEvaluateTour';
import useReviewSyllabusTour from './useReviewSyllabusTour';

import styles from './teacherHomepage.module.scss';

const CHECKLIST_ITEMS = [
  {id: 'view_syllabus', label: 'Review the syllabus'},
  {id: 'learn_to_evaluate', label: 'Learn how to evaluate'},
  {id: 'create_class_section', label: 'Create a class section'},
];

const recordTourStart = (
  tourName: string,
  demoType: DemoType,
  previouslyStartedNotFinished: boolean
) => {
  analyticsReporter.sendEvent(EVENTS.ONBOARDING_TOUR_STARTED, {
    tour_name: tourName,
    previously_started_not_finished: previouslyStartedNotFinished,
  });
  HttpClient.post(
    '/dashboardapi/v1/user_product_tours',
    JSON.stringify({
      tour_name: tourName,
      started_at: true,
      properties: {demo_type: demoType},
    }),
    true,
    {'Content-Type': 'application/json'}
  ).catch(err => console.error('Failed to record tour start:', err));
};

interface OnboardingChecklistProps {
  demoSection: Section | null;
  demoType: DemoType;
  isHidden: boolean;
  onHide: () => void;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  demoSection,
  demoType,
  isHidden,
  onHide,
}) => {
  const dispatch = useAppDispatch();
  const gradesTeaching = useAppSelector(
    state => state.currentUser.gradesTeaching
  );
  const createSectionTour = useCreateSectionTour(gradesTeaching);
  const reviewSyllabusTour = useReviewSyllabusTour(demoType);
  const learnHowToEvaluateTour = useLearnHowToEvaluateTour(demoType);

  const [completedTourNames, setCompletedTourNames] = React.useState<
    Set<string>
  >(new Set());
  const [startedTourNames, setStartedTourNames] = React.useState<Set<string>>(
    new Set()
  );
  const [pendingTour, setPendingTour] = React.useState<Tour | null>(null);
  const [resetFailed, setResetFailed] = React.useState(false);
  const [creationError, setCreationError] = React.useState(false);

  const stalenessCheck = React.useRef<Promise<boolean>>(Promise.resolve(false));

  React.useEffect(() => {
    HttpClient.get('/dashboardapi/v1/user_product_tours', true)
      .then(
        response =>
          response.json() as Promise<{completed: string[]; started: string[]}>
      )
      .then(({completed, started}) => {
        setCompletedTourNames(new Set(completed));
        setStartedTourNames(new Set(started));
      })
      .catch(err =>
        console.error('Failed to fetch tour completion status:', err)
      );
  }, []);

  const demoSectionId = demoSection?.id;

  React.useEffect(() => {
    stalenessCheck.current = confirmDemoSectionSettings(demoSectionId);
  }, [demoSectionId]);

  // When there is no real demo section yet, create one before starting the
  // tour so the tour has a real section ID to work with. A freshly created
  // section is never stale, so we skip the staleness check in that case.
  const ensureDemoSection = async (): Promise<boolean> => {
    if (demoSection?.id) return true;
    setCreationError(false);
    try {
      const section = await dispatch(createDemoSection(demoType));
      if (!section?.id) {
        setCreationError(true);
        return false;
      }
      stalenessCheck.current = Promise.resolve(false);
      return true;
    } catch (error) {
      if (!(error instanceof DemoSectionCreationError)) {
        console.error('Failed to create demo section:', error);
      }
      setCreationError(true);
      return false;
    }
  };

  const startTourOrBlock = async (tour: Tour | null) => {
    if (await stalenessCheck.current) {
      setPendingTour(tour);
    } else {
      tour?.start();
    }
  };

  const handleButtonClick = async (tourName: string) => {
    if (!(await ensureDemoSection())) return;
    const previouslyStartedNotFinished =
      startedTourNames.has(tourName) && !completedTourNames.has(tourName);
    recordTourStart(tourName, demoType, previouslyStartedNotFinished);
    if (tourName === 'create_class_section') {
      createSectionTour?.start();
    } else if (tourName === 'view_syllabus') {
      startTourOrBlock(reviewSyllabusTour);
    } else if (tourName === 'learn_to_evaluate') {
      startTourOrBlock(learnHowToEvaluateTour);
    }
  };

  const handleStalenessCancel = () => {
    pendingTour?.cancel();
    setPendingTour(null);
  };

  const handleStalenessReset = () => {
    const tour = pendingTour;
    setPendingTour(null);
    if (!demoSection) {
      return;
    }
    HttpClient.post(
      '/api/v1/sections/demo/reset',
      JSON.stringify({id: demoSection.id}),
      true,
      {'Content-Type': 'application/json'}
    )
      .then(() => {
        stalenessCheck.current = Promise.resolve(false);
        tour?.start();
      })
      .catch(err => {
        console.error('Failed to reset demo section:', err);
        setResetFailed(true);
      });
  };

  const allToursCompleted = CHECKLIST_ITEMS.every(({id}) =>
    completedTourNames.has(id)
  );

  if (isHidden) {
    return null;
  }

  return (
    <>
      {pendingTour && (
        <DemoSectionStalenessDialog
          onCancel={handleStalenessCancel}
          onReset={handleStalenessReset}
        />
      )}
      <Snackbar
        open={resetFailed}
        autoHideDuration={6000}
        onClose={() => setResetFailed(false)}
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
      >
        <Alert
          type="danger"
          size="m"
          text="We couldn't reset your demo section. Please try again."
          onClose={() => setResetFailed(false)}
        />
      </Snackbar>
      <Snackbar
        open={creationError}
        autoHideDuration={6000}
        onClose={() => setCreationError(false)}
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
      >
        <Alert
          type="danger"
          size="m"
          text="Couldn't create your practice section. Please try again."
          onClose={() => setCreationError(false)}
        />
      </Snackbar>
      <div
        className={`${styles.onboardingChecklistOuter}${
          allToursCompleted
            ? ` ${styles.onboardingChecklistOuterCelebration}`
            : ''
        }`}
      >
        <div className={styles.onboardingChecklistInner}>
          <div className={styles.onboardingChecklistInnerContent}>
            {allToursCompleted ? (
              <div className={styles.onboardingChecklistCelebration}>
                <span
                  aria-hidden="true"
                  className={styles.onboardingCelebrationEmoji}
                >
                  🎉
                </span>
                <Typography variant="h4" gutterBottom>
                  You're all set!
                </Typography>
                <Typography variant="body2" gutterBottom>
                  You've explored some of the teacher tools available with
                  CodeAI. As you continue to use CodeAI, your Teaching Assistant
                  is always available to answer questions, modify course
                  materials, provide professional learning and more.
                </Typography>
                <MuiButton
                  type="button"
                  variant="outlined"
                  color="tertiary"
                  onClick={onHide}
                >
                  Complete onboarding
                </MuiButton>
              </div>
            ) : (
              <>
                <Typography variant="h4">
                  <span className={styles.gradientIcon}>
                    <FontAwesomeV6Icon iconName="sparkle" iconStyle="solid" />
                  </span>
                  Where should we start?
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Teaching Assistant can help you get started with CodeAI
                </Typography>
                <div className={styles.onboardingChecklistButtons}>
                  {CHECKLIST_ITEMS.map(({id, label}) => (
                    <MuiButton
                      key={id}
                      variant="outlined"
                      color="secondary"
                      className={styles.onboardingChecklistButton}
                      onClick={() => handleButtonClick(id)}
                      type="button"
                      size="small"
                    >
                      {completedTourNames.has(id) && (
                        <span className={styles.onboardingChecklistCheckIcon}>
                          <FontAwesomeV6Icon
                            iconName="circle-check"
                            iconStyle="solid"
                          />
                        </span>
                      )}
                      {label}
                    </MuiButton>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        {!allToursCompleted && (
          <MuiButton type="button" onClick={onHide} color="tertiary">
            Hide onboarding
          </MuiButton>
        )}
      </div>
    </>
  );
};

export default OnboardingChecklist;

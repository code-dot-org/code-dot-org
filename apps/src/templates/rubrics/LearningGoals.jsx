import {
  BodyThreeText,
  OverlineThreeText,
  Heading5,
  StrongText,
} from '@code-dot-org/component-library/typography';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect, useState, useRef, useMemo} from 'react';

import EditorAnnotator from '@cdo/apps/EditorAnnotator';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import AiAssessment from './AiAssessment';
import AiAssessmentFeedbackContext, {
  NO_FEEDBACK,
} from './AiAssessmentFeedbackContext';
import {annotateLines, clearAnnotations} from './annotateEditor';
import EvidenceLevels from './EvidenceLevels';
import ProgressRing from './ProgressRing';
import {UNDERSTANDING_LEVEL_STRINGS} from './rubricHelpers';
import {
  learningGoalShape,
  reportingDataShape,
  studentLevelInfoShape,
  submittedEvaluationShape,
  aiEvaluationShape,
} from './rubricShapes';

import style from './rubrics.module.scss';

const INVALID_UNDERSTANDING = -1;

export default function LearningGoals({
  productTour,
  open,
  learningGoals,
  teacherHasEnabledAi,
  canProvideFeedback,
  reportingData,
  studentLevelInfo,
  submittedEvaluation,
  isStudent,
  feedbackAdded,
  setFeedbackAdded,
  aiEvaluations,
}) {
  const STATUS = Object.freeze({
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    FINISHED: 2,
    ERROR: 3,
  });
  const [autosaveStatus, setAutosaveStatus] = useState(STATUS.NOT_STARTED);
  const [displayFeedback, setDisplayFeedback] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [displayUnderstanding, setDisplayUnderstanding] = useState(
    INVALID_UNDERSTANDING
  );
  const [aiFeedback, setAiFeedback] = useState(NO_FEEDBACK);
  const [aiFeedbackId, setAiFeedbackId] = useState(null);
  const [doneLoading, setDoneLoading] = useState(false);

  // The position of the 'arrow' that points up from the AiAssessment region
  // to the EvidenceLevels component. When this value is 0, there is no
  // specific left and the arrow is centered.
  const [arrowLeft, setArrowLeft] = useState(10);

  // The ref version of this state is used when updating the information based
  // on saved info retrieved by network requests so as not to race them.
  const [currentLearningGoal, setCurrentLearningGoal] = useState(0);
  const currentLearningGoalRef = useRef(0);
  const learningGoalEvalIds = useRef(Array(learningGoals.length).fill(null));
  const teacherFeedbacks = useRef(Array(learningGoals.length).fill(''));
  const teacherFeedbacksLoaded = useRef(
    Array(learningGoals.length).fill(false)
  );
  const understandingLevels = useRef(
    Array(learningGoals.length).fill(INVALID_UNDERSTANDING)
  );

  const aiEnabled =
    currentLearningGoal === learningGoals.length
      ? false
      : learningGoals[currentLearningGoal].aiEnabled && teacherHasEnabledAi;
  const base_teacher_evaluation_endpoint = '/learning_goal_teacher_evaluations';

  // Timer variables for autosaving
  const autosaveTimer = useRef();
  const saveAfter = 2000;

  const handleFeedbackChange = event => {
    if (
      currentLearningGoal !== learningGoals.length &&
      studentLevelInfo.user_id &&
      learningGoals[currentLearningGoal].id
    ) {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
      teacherFeedbacks.current[currentLearningGoal] = event.target.value;
      setDisplayFeedback(teacherFeedbacks.current[currentLearningGoal]);
      autosaveTimer.current = setTimeout(() => {
        autosave();
      }, saveAfter);
    }
  };

  const aiEvalInfo = useMemo(() => {
    if (!!aiEvaluations && currentLearningGoal < learningGoals.length) {
      const aiInfo = aiEvaluations.find(
        item => item.learning_goal_id === learningGoals[currentLearningGoal].id
      );
      if (aiInfo) {
        aiInfo.showExactMatch = aiInfo.aiConfidenceExactMatch === 3;
      }
      return aiInfo;
    } else {
      return null;
    }
  }, [learningGoals, aiEvaluations, currentLearningGoal]);

  // The backend provides two ai confidence levels. aiConfidenceExactMatch is
  // our confidence that the ai score is exactly correct, and and
  // aiConfidencePassFail indicates our confidence in its accuracy on a
  // pass/fail basis where Extended/Convincing are passing and Limited/No are
  // failing.
  //
  // Use the precomputed showExactMatch value to decide which of these two
  // confidence levels we will show in the UI. Throughout client code,
  // aiConfidence should represent this computed value, and the more specific
  // variable names should be used for exact-match or pass/fail confidence.
  let aiConfidence;
  if (aiEvalInfo) {
    aiConfidence = aiEvalInfo.showExactMatch
      ? aiEvalInfo.aiConfidenceExactMatch
      : aiEvalInfo.aiConfidencePassFail;
  }

  const autosave = () => {
    if (!productTour) {
      setAutosaveStatus(STATUS.IN_PROGRESS);
      const bodyData = JSON.stringify({
        studentId: studentLevelInfo.user_id,
        learningGoalId: learningGoals[currentLearningGoal].id,
        feedback: teacherFeedbacks.current[currentLearningGoal],
        understanding: understandingLevels.current[currentLearningGoal],
      });
      HttpClient.put(
        `${base_teacher_evaluation_endpoint}/${learningGoalEvalIds.current[currentLearningGoal]}`,
        bodyData,
        true,
        {
          'Content-Type': 'application/json',
        }
      )
        .then(() => {
          setAutosaveStatus(STATUS.FINISHED);
          if (!feedbackAdded) {
            setFeedbackAdded(true);
          }
        })
        .catch(error => {
          console.error(error);
          setAutosaveStatus(STATUS.ERROR);
        });
      clearTimeout(autosaveTimer.current);
    }
  };

  useEffect(() => {
    if (studentLevelInfo?.user_id && learningGoals && !productTour) {
      // Set our current idea of the feedback immediately
      setDisplayFeedback(teacherFeedbacks.current[currentLearningGoal]);
      setLoaded(teacherFeedbacksLoaded.current[currentLearningGoal]);
      setDisplayUnderstanding(understandingLevels.current[currentLearningGoal]);

      learningGoals.forEach((learningGoal, index) => {
        // Only load prior learning goal feedback once
        if (teacherFeedbacksLoaded.current[index]) {
          return;
        }
        const body = JSON.stringify({
          userId: studentLevelInfo.user_id,
          learningGoalId: learningGoal.id,
        });
        HttpClient.post(
          `${base_teacher_evaluation_endpoint}/get_or_create_evaluation`,
          body,
          true,
          {
            'Content-Type': 'application/json',
          }
        )
          .then(response => response.json())
          .then(json => {
            learningGoalEvalIds.current[index] = json.id;
            if (json.feedback) {
              teacherFeedbacks.current[index] = json.feedback;
            }
            teacherFeedbacksLoaded.current[index] = true;
            if (json.understanding >= 0 && json.understanding !== null) {
              understandingLevels.current[index] = json.understanding;
            }

            // Uses the redundant ref here instead of state to defeat a race
            // condition where the current learning goal changes before the
            // fetch resolves.
            if (index === currentLearningGoalRef.current) {
              setDisplayFeedback(teacherFeedbacks.current[index]);
              setLoaded(teacherFeedbacksLoaded.current[index]);
              setDisplayUnderstanding(understandingLevels.current[index]);
            }
            if (index === learningGoals.length - 1) {
              setDoneLoading(true);
            }
          })
          .catch(error => console.error(error));
      });
    }
  }, [
    studentLevelInfo?.user_id,
    learningGoals,
    currentLearningGoal,
    open,
    productTour,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, {once: true});
  });

  // Callback to retrieve understanding data from EvidenceLevels
  const radioButtonCallback = radioButtonData => {
    if (currentLearningGoal !== learningGoals.length) {
      analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_EVIDENCE_LEVEL_SELECTED, {
        ...(reportingData || {}),
        learningGoalId: learningGoals[currentLearningGoal].id,
        learningGoal: learningGoals[currentLearningGoal].learningGoal,
        newlySelectedEvidenceLevel: radioButtonData,
        previouslySelectedEvidenceLevel:
          understandingLevels.current[currentLearningGoal],
      });
      setDisplayUnderstanding(radioButtonData);
      understandingLevels.current[currentLearningGoal] = radioButtonData;
      autosave();
    }
  };

  const renderAutoSaveTextbox = () => {
    return (
      <div className={`${style.feedbackArea} uitest-learning-goal`}>
        <label className={style.evidenceLevelLabel}>
          <span>{i18n.feedbackHeader()}</span>
          <textarea
            id="ui-teacherFeedback"
            className={style.inputTextbox}
            placeholder={i18n.feedbackPlaceholderShort()}
            name="teacherFeedback"
            value={displayFeedback}
            onChange={handleFeedbackChange}
            disabled={!canProvideFeedback || !loaded}
          />
        </label>
        {autosaveStatus === STATUS.IN_PROGRESS ? (
          <span className={style.autosaveMessage}>{i18n.saving()}</span>
        ) : (
          autosaveStatus === STATUS.FINISHED && (
            <span id="ui-autosaveConfirm" className={style.autosaveMessage}>
              <FontAwesome icon="circle-check" /> {i18n.savedToGallery()}
            </span>
          )
        )}
        {autosaveStatus === STATUS.ERROR && (
          <span className={style.autosaveMessage}>
            {i18n.feedbackSaveError()}
          </span>
        )}
      </div>
    );
  };

  const renderSubmittedFeedbackTextbox = () => {
    return (
      <div className={style.feedbackArea}>
        <label className={style.evidenceLevelLabel}>
          <span>{i18n.feedback()}</span>
          <textarea
            className={style.inputTextbox}
            name="teacherFeedback"
            value={submittedEvaluation.feedback}
            disabled
          />
        </label>
      </div>
    );
  };

  // Remember whether no not the code editor is loaded
  const studio = studioApp();
  const [editorLoaded, setEditorLoaded] = useState(!!studio.editor);
  useEffect(() => {
    const handleAfterInit = () => {
      setEditorLoaded(true);
    };

    studio.on('afterInit', handleAfterInit);

    return () => {
      studio.off('afterInit', handleAfterInit);
    };
  }, [studio]);

  const aiEvidence = useMemo(() => {
    if (!editorLoaded) {
      return;
    }

    const onEvidenceTooltipOpened = () => {
      // When the tooltip is opened, we will record that this happened alongside
      // information about the learning goal.
      const eventName = EVENTS.TA_RUBRIC_EVIDENCE_TOOLTIP_HOVERED;
      analyticsReporter.sendEvent(eventName, {
        ...(reportingData || {}),
        learningGoalKey: learningGoals[currentLearningGoal].key,
        learningGoal: learningGoals[currentLearningGoal].learningGoal,
        studentId: !!studentLevelInfo ? studentLevelInfo.user_id : '',
      });
    };

    // Annotate the lines based on the AI observation
    clearAnnotations();

    if (!!aiEvalInfo && !productTour) {
      const evidence = aiEvalInfo.evidence || '';
      const annotations = annotateLines(
        evidence,
        aiEvalInfo.observations,
        onEvidenceTooltipOpened
      );
      // Scroll to first evidence, if possible
      if (annotations[0]?.firstLine) {
        EditorAnnotator.scrollToLine(annotations[0].firstLine);
      }
      return annotations;
    } else if (productTour) {
      return [
        {
          firstLine: 12,
          lastLine: 13,
          message: 'A sprite is defined here.',
        },
      ];
    }
    return [];
  }, [
    aiEvalInfo,
    editorLoaded,
    productTour,
    currentLearningGoal,
    learningGoals,
    reportingData,
    studentLevelInfo,
  ]);

  const onCarouselPress = buttonValue => {
    if (!productTour) {
      let currentIndex = currentLearningGoal;
      currentIndex += buttonValue;
      if (currentIndex < 0) {
        currentIndex = learningGoals.length;
      } else if (currentIndex > learningGoals.length) {
        currentIndex = 0;
      }
      currentLearningGoalRef.current = currentIndex;
      setCurrentLearningGoal(currentIndex);

      // Clear feedback (without sending it)
      setAiFeedback(NO_FEEDBACK);
      setAiFeedbackId(null);

      // Annotate the lines based on the AI observation
      clearAnnotations();
      if (currentIndex !== learningGoals.length) {
        if (!isStudent) {
          const eventName = EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED;
          analyticsReporter.sendEvent(eventName, {
            ...(reportingData || {}),
            learningGoalKey: learningGoals[currentIndex].key,
            learningGoal: learningGoals[currentIndex].learningGoal,
            studentId: !!studentLevelInfo ? studentLevelInfo.user_id : '',
          });
        }
      }
    }
  };

  const handleKeyDown = event => {
    if (open && !productTour) {
      if (event.key === 'ArrowLeft') {
        onCarouselPress(-1);
      } else if (event.key === 'ArrowRight') {
        onCarouselPress(1);
      }
    }
  };

  if (productTour && currentLearningGoal !== 0) {
    setCurrentLearningGoal(0);
  }

  return (
    <div className={style.learningGoalsContainer}>
      <div className={style.learningGoalsHeader}>
        <div className={style.learningGoalsHeaderLeftSide}>
          <button
            type="button"
            className={classnames(
              style.learningGoalButton,
              style.learningGoalButtonLeft
            )}
            aria-label={i18n.rubricPreviousLearningGoal()}
            onClick={() => onCarouselPress(-1)}
          >
            <FontAwesome icon="angle-left" />
          </button>
          <ProgressRing
            className={style.learningGoalRing}
            learningGoals={learningGoals}
            currentLearningGoal={currentLearningGoal}
            understandingLevels={understandingLevels.current}
            radius={30}
            stroke={4}
            loaded={doneLoading}
          />
          <div className={style.learningGoalsHeaderText}>
            <Heading5
              className={[
                style.learningGoalsHeaderTextBody,
                'uitest-learning-goal-title',
              ]}
            >
              <span>
                {currentLearningGoal === learningGoals.length
                  ? i18n.rubricLearningGoalSummary()
                  : learningGoals[currentLearningGoal].learningGoal}
              </span>
              {aiEnabled && displayUnderstanding === INVALID_UNDERSTANDING && (
                <AiToken />
              )}
            </Heading5>
            <BodyThreeText className={style.learningGoalsHeaderTextBody}>
              {i18n.next()}:{' '}
              {currentLearningGoal + 1 === learningGoals.length
                ? i18n.rubricLearningGoalSummary()
                : learningGoals[
                    (currentLearningGoal + 1) % learningGoals.length
                  ].learningGoal}
            </BodyThreeText>
          </div>
        </div>
        <div className={style.learningGoalsHeaderRightSideV2}>
          {submittedEvaluation && (
            <div className={style.submittedEvaluation}>
              {submittedEvaluation.understanding !== null && (
                <BodyThreeText className={style.feedbackIndicatorText}>
                  {
                    UNDERSTANDING_LEVEL_STRINGS[
                      submittedEvaluation.understanding
                    ]
                  }
                </BodyThreeText>
              )}
              {submittedEvaluation.feedback && (
                <FontAwesome
                  icon="message"
                  className="fa-regular"
                  title={i18n.feedback()}
                />
              )}
            </div>
          )}
          <button
            id="uitest-next-goal"
            type="button"
            className={classnames(
              style.learningGoalButton,
              style.learningGoalButtonRight
            )}
            aria-label={i18n.rubricNextLearningGoal()}
            onClick={() => onCarouselPress(1)}
          >
            <FontAwesome icon="angle-right" />
          </button>
        </div>
      </div>

      <div className={style.learningGoalOuterBlock}>
        {currentLearningGoal !== learningGoals.length && (
          <div className={style.learningGoalExpanded}>
            <AiAssessmentFeedbackContext.Provider
              value={{aiFeedback, setAiFeedback, aiFeedbackId, setAiFeedbackId}}
            >
              {!!submittedEvaluation && renderSubmittedFeedbackTextbox()}
              <div>
                <EvidenceLevels
                  productTour={productTour}
                  aiEvalInfo={aiEvalInfo}
                  isAiAssessed={learningGoals[currentLearningGoal].aiEnabled}
                  learningGoalKey={learningGoals[currentLearningGoal].key}
                  evidenceLevels={
                    learningGoals[currentLearningGoal].evidenceLevels
                  }
                  canProvideFeedback={canProvideFeedback}
                  understanding={displayUnderstanding}
                  radioButtonCallback={radioButtonCallback}
                  submittedEvaluation={submittedEvaluation}
                  isStudent={isStudent}
                  isAutosaving={autosaveStatus === STATUS.IN_PROGRESS}
                  arrowPositionCallback={setArrowLeft}
                />
                {teacherHasEnabledAi &&
                  !!studentLevelInfo &&
                  !!aiEvalInfo &&
                  aiEvalInfo.understanding !== undefined && (
                    <div
                      id="tour-ai-assessment"
                      className={style.aiAssessmentOuterBlock}
                    >
                      {/* Draw the arrow pointing at the AI suggested buttons.
                          EvidenceLevels sets the arrowLeft parameter to reflect the
                          position of the buttons. And we subtract some to center it.*/}
                      <div
                        id="ai-assessment-arrow"
                        className={style.aiAssessmentArrow}
                        style={arrowLeft === 0 ? {} : {left: arrowLeft - 10}}
                      />
                      <AiAssessment
                        isAiAssessed={
                          learningGoals[currentLearningGoal].aiEnabled
                        }
                        currentLearningGoal={currentLearningGoal}
                        learningGoals={learningGoals}
                        reportingData={reportingData}
                        studentLevelInfo={studentLevelInfo}
                        studentName={studentLevelInfo.name}
                        aiConfidence={aiConfidence}
                        aiUnderstandingLevel={aiEvalInfo.understanding}
                        aiEvalInfo={aiEvalInfo}
                        aiEvidence={aiEvidence}
                      />
                    </div>
                  )}
                {learningGoals[currentLearningGoal].tips && !isStudent && (
                  <details>
                    <summary className={style.tipsDetailsSummary}>
                      <strong>{i18n.tipsForEvaluation()}</strong>
                    </summary>

                    <div className={style.learningGoalsTips}>
                      <SafeMarkdown
                        markdown={learningGoals[currentLearningGoal].tips}
                      />
                    </div>
                  </details>
                )}
              </div>
              {!!studentLevelInfo && renderAutoSaveTextbox()}
            </AiAssessmentFeedbackContext.Provider>
          </div>
        )}
        {currentLearningGoal === learningGoals.length && !productTour && (
          <div>
            {learningGoals.map((lg, i) => (
              <div className={style.learningGoalSummary} key={i}>
                <BodyThreeText>
                  <StrongText>{lg.learningGoal}</StrongText>
                </BodyThreeText>
                <BodyThreeText>
                  {UNDERSTANDING_LEVEL_STRINGS[understandingLevels.current[i]]}
                </BodyThreeText>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

LearningGoals.propTypes = {
  productTour: PropTypes.bool,
  open: PropTypes.bool,
  teacherHasEnabledAi: PropTypes.bool,
  canProvideFeedback: PropTypes.bool,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  submittedEvaluation: submittedEvaluationShape,
  isStudent: PropTypes.bool,
  feedbackAdded: PropTypes.bool,
  setFeedbackAdded: PropTypes.func,
  learningGoals: PropTypes.arrayOf(learningGoalShape),
  aiEvaluations: PropTypes.arrayOf(aiEvaluationShape),
};

const AiToken = () => {
  return (
    <div className={classnames('uitest-uses-ai', style.aiTokenContainer)}>
      {' '}
      <OverlineThreeText
        className={classnames(style.aiToken, style.aiTokenText)}
      >
        {i18n.usesAi()}
      </OverlineThreeText>
    </div>
  );
};

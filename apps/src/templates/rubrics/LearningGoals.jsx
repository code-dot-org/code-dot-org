import React, {useEffect, useState, useRef} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import classnames from 'classnames';
import style from './rubrics.module.scss';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import EditorAnnotator from '@cdo/apps/EditorAnnotator';
import {
  learningGoalShape,
  reportingDataShape,
  studentLevelInfoShape,
  submittedEvaluationShape,
  aiEvaluationShape,
} from './rubricShapes';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  BodyThreeText,
  BodyFourText,
  ExtraStrongText,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import EvidenceLevels from './EvidenceLevels';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import AiAssessment from './AiAssessment';
import HttpClient from '@cdo/apps/util/HttpClient';
import {UNDERSTANDING_LEVEL_STRINGS} from './rubricHelpers';
import ProgressRing from './ProgressRing';

const INVALID_UNDERSTANDING = -1;

/**
 * Clear prior line annotations
 */
export function clearAnnotations(annotator) {
  annotator.clearAnnotations();
  annotator.clearHighlightedLines();
}

/**
 * Retrieves the currently viewed source code.
 *
 * All comments are replaced with whitespace of equal length. Newlines are
 * preserved within block comments.
 *
 * @returns {string} The code with comments replaced with whitespace.
 */
export function getAnonymizedCode() {
  // Find code snippet by looking at the student code
  let code = studioApp().getCode();

  // Replace comments with whitespace. Our AI does not see the comments.
  // So, we must replace them with whitespace so we can find the right
  // code to reference.

  // This regex pattern captures three groups:
  // 1) Single or double quoted strings
  // 2) Multi-line comments
  // 3) Single-line comments
  const pattern = /(".*?[^\\]"|\'.*?[^\\]\'|\/\*.*?\*\/|\/\/[^\n]*)/gs;
  for (const submatch of code.matchAll(pattern)) {
    const context = submatch[0].trim();
    if (!context.startsWith('"') && !context.startsWith("'")) {
      code = code.replace(context, context.replace(/[^\n]/g, ' '));
    }
  }

  return code;
}

/**
 * Returns the first and last line that contains the given code snippet.
 *
 * This does not assume that the whitespace within the snippet matches the
 * whitespace within the code. For example, the snippet might have no newlines:
 * `var x = 0; x = x + 5;` when the code itself has each statement on its own
 * line.
 *
 * This function handles that by matching as much as it can and stripping the
 * whitespace from its currently position. When it consumes the entire snippet,
 * the function returns the line numbers within which that code appeared.
 *
 * @param {string} code - The entire source code to match against.
 * @param {Array} lines - The code pre-separated by line.
 * @param {string} snippet - A segment of code to find in the given code.
 * @returns {[number, number]} The line numbers of the region or null if not found.
 */
export function findCodeRegion(code, lines, snippet) {
  // Do not allow matching against whitespace
  if (snippet.trim() === '') {
    return [null, null];
  }

  // Attempt to just find the code in the full code listing
  let index = code.indexOf(snippet);
  let lastIndex = index + snippet.length;
  if (index < 0) {
    // Failing to find it, we need to find it line by line instead
    let context = snippet;
    let position = 0;
    for (let line of lines) {
      // Remember the original length of the line
      let lineLength = line.length;
      line = line.trim();
      if (line !== '') {
        if (context.startsWith(line)) {
          if (index < 0) {
            // Remember the first position in the original code that
            // the AI references.
            index = position;
          }
          // Remember the last position in the original code.
          lastIndex = position + lineLength;
          context = context.substring(line.length + 1).trim();
          if (context === '') {
            // All of the code was found
            break;
          }
        } else {
          // We didn't match it. Reset our search.
          context = snippet;
          index = -1;
        }
      }

      // Move the current search position
      position += lineLength + 1;
    }
  }

  // As long as we found a region, we will determine what the line
  // number was for the first and last line of the region.
  if (index < 0) {
    return [null, null];
  }

  let lineNumber = (code.substring(0, index).match(/\n/g) || []).length + 1;
  let lastLineNumber =
    (code.substring(0, lastIndex).match(/\n/g) || []).length + 1;

  return [lineNumber, lastLineNumber];
}

/**
 * Adds annotations to the source code viewed in the current editor based
 * on the AI observations of the learning goal referenced by the given index.
 *
 * Observations is a text block generated by the AI. This will parse out
 * sections that match a particular style:
 *
 *   Line x: Some description `some code`
 *   Line x-y: Some description `some code`
 *
 * More than one can appear within the same text chunk:
 *
 *   Line 3: Creates a sprite `var p = createSprite(100, 100);` Line 4: Sets
 *   velocity `p.velocityX = 0;`
 *
 * In this case, we expect to highlight lines 3 and 4 and to annotate each with
 * the provided description. Although, we might find that this code actually
 * exists on lines 5 and 6, since the AI is somewhat unreliable about line
 * number reporting. The `findCodeRegion` function is responsible for finding
 * the actual lines.
 *
 * When the AI gives us multiple lines, it will generally remove the whitespace.
 * That it, the newlines are not within the observation text block. We have to
 * match the code similarly. You might see this:
 *
 *   Line 5: Jump condition `if (keyDown('up')) { p.velocityY = -100; }`
 *
 * In this case, we might find this code on lines 8 through 10. So, we would
 * annotate line 8 and highlight lines 8 through 10.
 *
 * @param {string} observations - A text block described above.
 */
export function annotateLines(observations, annotator) {
  // Get a reference to all the whitespaced lines of code
  const code = getAnonymizedCode();
  const lines = code.split('\n');

  // Go through the AI observations
  // For every reference the AI gave us, we will find it in the code.
  // The AI has trouble giving line numbers, so even though we parse
  // those out, we do not trust them and instead find the code it
  // references to highlight it.
  for (const match of observations.matchAll(
    'Line (\\d+)(?:\\s*-\\s*(\\d+))?:(.+?)\\s*(?=Line|$)'
  )) {
    let lineNumber = parseInt(match[1]);
    let lastLineNumber = parseInt(match[2] || lineNumber);
    let found = false;
    let hasSnippet = false;
    const context = match[3].trim();

    const message = context
      .substring(0, context.indexOf('`') || context.length)
      .trim();

    // We look at all of the code references the AI gave us which are
    // surrounded by backticks.
    const references = context.substring(message.length);
    for (const submatch of references.matchAll(/`([^\`]+)`/g)) {
      let snippet = submatch[1].trim();

      // Skip empty code snippets... just in case the AI very strangely
      // gives an empty code response (e.g. 'Line 1: Description ` `')
      if (snippet === '') {
        continue;
      }

      // We have some kind of code reference
      hasSnippet = true;

      // Find where this snippet actually happens
      let [lineNumber, lastLineNumber] = findCodeRegion(code, lines, snippet);

      // Annotate that first line and highlight all lines, if they were found
      if (lineNumber && lastLineNumber) {
        found = true;
        annotator.annotateLine(message, lineNumber);
        for (let i = lineNumber; i <= lastLineNumber; i++) {
          annotator.highlightLine(i);
        }
      }
    }

    if (!found && hasSnippet) {
      annotator.annotateLine(message, lineNumber);
      for (let i = lineNumber; i <= lastLineNumber; i++) {
        annotator.highlightLine(i);
      }
    }
  }
}

export default function LearningGoals({
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
  const [displayUnderstanding, setDisplayUnderstanding] = useState(
    INVALID_UNDERSTANDING
  );
  const [currentLearningGoal, setCurrentLearningGoal] = useState(0);
  const learningGoalEvalIds = useRef(Array(learningGoals.length).fill(null));
  const teacherFeedbacks = useRef(Array(learningGoals.length).fill(''));
  const understandingLevels = useRef(
    Array(learningGoals.length).fill(INVALID_UNDERSTANDING)
  );

  // Line annotation service
  const annotator = new EditorAnnotator(studioApp());

  const aiEnabled =
    learningGoals[currentLearningGoal].aiEnabled && teacherHasEnabledAi;
  const base_teacher_evaluation_endpoint = '/learning_goal_teacher_evaluations';

  // Timer variables for autosaving
  const autosaveTimer = useRef();
  const saveAfter = 2000;

  const handleFeedbackChange = event => {
    if (studentLevelInfo.user_id && learningGoals[currentLearningGoal].id) {
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

  const getAiInfo = learningGoalId => {
    if (!!aiEvaluations) {
      const aiInfo = aiEvaluations.find(
        item => item.learning_goal_id === learningGoalId
      );
      return aiInfo;
    } else {
      return null;
    }
  };

  const aiEvalInfo = getAiInfo(learningGoals[currentLearningGoal].id);

  const autosave = () => {
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
  };

  useEffect(() => {
    if (studentLevelInfo && learningGoals) {
      learningGoals.forEach((learningGoal, index) => {
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
            if (json.understanding >= 0 && json.understanding !== null) {
              understandingLevels.current[index] = json.understanding;
            }
          })
          .catch(error => console.error(error));
      });
      setDisplayFeedback(teacherFeedbacks.current[currentLearningGoal]);
      setDisplayUnderstanding(understandingLevels.current[currentLearningGoal]);
    }
  }, [studentLevelInfo, learningGoals, currentLearningGoal, open]);

  useEffect(() =>
    document.addEventListener('keydown', handleKeyDown, {once: true})
  );

  // Callback to retrieve understanding data from EvidenceLevels
  const radioButtonCallback = radioButtonData => {
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
  };

  const renderAutoSaveTextbox = () => {
    return (
      <div className={`${style.feedbackArea} uitest-learning-goal`}>
        <label className={style.evidenceLevelLabel}>
          <span>{i18n.feedback()}</span>
          <textarea
            id="ui-teacherFeedback"
            className={style.inputTextbox}
            name="teacherFeedback"
            value={displayFeedback}
            onChange={handleFeedbackChange}
            disabled={!canProvideFeedback}
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

  const onCarouselPress = buttonValue => {
    let currentIndex = currentLearningGoal;
    currentIndex += buttonValue;
    if (currentIndex < 0) {
      currentIndex = learningGoals.length - 1;
    } else if (currentIndex >= learningGoals.length) {
      currentIndex = 0;
    }
    setCurrentLearningGoal(currentIndex);

    // Annotate the lines based on the AI observation
    clearAnnotations(annotator);
    const aiEvalInfo = getAiInfo(learningGoals[currentIndex].id);
    if (!!aiEvalInfo && aiEvalInfo.observations) {
      annotateLines(aiEvalInfo.observations, annotator);
    }

    if (!isStudent) {
      const eventName = EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED;
      analyticsReporter.sendEvent(eventName, {
        ...(reportingData || {}),
        learningGoalKey: learningGoals[currentIndex].key,
        learningGoal: learningGoals[currentIndex].learningGoal,
      });
    }
  };

  const handleKeyDown = event => {
    if (event.key === 'ArrowLeft') {
      onCarouselPress(-1);
    } else if (event.key === 'ArrowRight') {
      onCarouselPress(1);
    }
  };

  return (
    <div className={style.learningGoalsContainer}>
      <div className={style.learningGoalsHeader}>
        <div className={style.learningGoalsHeaderLeftSide}>
          <button
            type="button"
            className={style.learningGoalButton}
            onClick={() => onCarouselPress(-1)}
          >
            <FontAwesome icon="angle-left" />
          </button>
          <ProgressRing
            learningGoals={learningGoals}
            currentLearningGoal={currentLearningGoal}
            understandingLevels={understandingLevels.current}
            radius={30}
            stroke={4}
          />
          <div className={style.learningGoalsHeaderText}>
            <Heading6>
              {learningGoals[currentLearningGoal].learningGoal}
            </Heading6>
            <BodyThreeText>
              {i18n.next()}:{' '}
              {
                learningGoals[(currentLearningGoal + 1) % learningGoals.length]
                  .learningGoal
              }
            </BodyThreeText>
          </div>
        </div>
        <div className={style.learningGoalsHeaderRightSideV2}>
          {aiEnabled && displayUnderstanding === INVALID_UNDERSTANDING && (
            <AiToken />
          )}
          {/*TODO: Display status of feedback*/}
          {canProvideFeedback &&
            aiEnabled &&
            displayUnderstanding === INVALID_UNDERSTANDING && (
              <BodyThreeText>{i18n.approve()}</BodyThreeText>
            )}
          {canProvideFeedback &&
            !aiEnabled &&
            displayUnderstanding === INVALID_UNDERSTANDING && (
              <BodyThreeText>{i18n.evaluate()}</BodyThreeText>
            )}
          {displayUnderstanding >= 0 && (
            <BodyThreeText>
              {UNDERSTANDING_LEVEL_STRINGS[displayUnderstanding]}
            </BodyThreeText>
          )}
          {submittedEvaluation && (
            <div className={style.submittedEvaluation}>
              {submittedEvaluation.understanding !== null && (
                <BodyThreeText>
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
            className={style.learningGoalButton}
            onClick={() => onCarouselPress(1)}
          >
            <FontAwesome icon="angle-right" />
          </button>
        </div>
      </div>

      {/*TODO: Pass through data to child component*/}
      <div>
        <div className={style.learningGoalExpanded}>
          {!!submittedEvaluation && renderSubmittedFeedbackTextbox()}
          <EvidenceLevels
            aiEvalInfo={aiEvalInfo}
            learningGoalKey={learningGoals[currentLearningGoal].key}
            evidenceLevels={learningGoals[currentLearningGoal].evidenceLevels}
            canProvideFeedback={canProvideFeedback}
            understanding={displayUnderstanding}
            radioButtonCallback={radioButtonCallback}
            submittedEvaluation={submittedEvaluation}
            isStudent={isStudent}
            isAutosaving={autosaveStatus === STATUS.IN_PROGRESS}
          />
          {teacherHasEnabledAi &&
            !!studentLevelInfo &&
            !!aiEvalInfo &&
            aiEvalInfo.understanding !== undefined && (
              <div className={style.openedAiAssessment}>
                <AiAssessment
                  isAiAssessed={learningGoals[currentLearningGoal].aiEnabled}
                  studentName={studentLevelInfo.name}
                  aiConfidence={aiEvalInfo.ai_confidence}
                  aiUnderstandingLevel={aiEvalInfo.understanding}
                  aiEvalInfo={aiEvalInfo}
                />
              </div>
            )}
          {learningGoals[currentLearningGoal].tips && !isStudent && (
            <details>
              <summary>
                <strong>{i18n.tipsForEvaluation()}</strong>
              </summary>

              <div className={style.learningGoalsTips}>
                <SafeMarkdown
                  markdown={learningGoals[currentLearningGoal].tips}
                />
              </div>
            </details>
          )}
          {!!studentLevelInfo && renderAutoSaveTextbox()}
        </div>
      </div>
    </div>
  );
}

LearningGoals.propTypes = {
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
    <div className="uitest-uses-ai">
      {' '}
      <BodyFourText className={classnames(style.aiToken, style.aiTokenText)}>
        <ExtraStrongText>{i18n.usesAi()}</ExtraStrongText>
      </BodyFourText>
    </div>
  );
};

import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import classnames from 'classnames';
import i18n from '@cdo/locale';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  reportingDataShape,
  rubricShape,
  studentLevelInfoShape,
} from './rubricShapes';
import RubricContent from './RubricContent';
import RubricSettings from './RubricSettings';
import RubricTabButtons from './RubricTabButtons';
import experiments from '@cdo/apps/util/experiments';

// TODO: XXX: some throwaway line annotations
const THROWAWAY_LINE_ANNOTATIONS = {
  'Program Development - Program Sequence':
    'Line 5: The sprite is defined here. `var frog = createSprite(175, 325);` Line 6: The sprite animation is set here. `frog.setAnimation("frog");` Line 7: Another sprite is defined here. `var mushroom = createSprite(450, 325);` Line 8: The sprite animation is set here. `mushroom.setAnimation("mushroom");` Line 9: The sprite velocity is set here. `mushroom.velocityX = -5;` Line 10: Another sprite is defined here. `var fly = createSprite(475, randomNumber(175, 325));` Line 11: The sprite animation is set here. `fly.setAnimation("fly");` Line 12: The sprite velocity is set here. `fly.velocityY = -7;` Line 16: The variables are defined here. `var score = 0;` `var health = 100;` Line 22: The background is set here. `background("skyblue");` Line 23: The ground is drawn here. `fill("green");` `rect(0, 360, 400, 40);` Line 38: The jumping conditionals are set here. `if (frog.y > 324) {` `if (keyDown("up")) {` `frog.velocityY = -5;` `} else {` `frog.velocityY = 0;` `}` `}` Line 49: The looping conditional is set here. `if (mushroom.x < -30) {` `mushroom.x = 430;` `}` Line 53: The sprites are drawn here. `drawSprites();` Line 57: The scoreboard is added here. `fill("black");` `textSize(20);` `text("Health:", 280, 30);` `text (health, 350, 30);` Line 62: The game over condition is set here. `if (health < 0) {` `background("black");` `fill("green");` `textSize(50);` `text("Game Over!" , 40, 200);` `}`',
  'Modularity - Multiple Sprites':
    'Line 5: The sprite is defined here. `var frog = createSprite(175, 325);` Line 6: The sprite animation is set here. `frog.setAnimation("frog");` Line 7: Another sprite is defined here. `var mushroom = createSprite(450, 325);` Line 8: The sprite animation is set here. `mushroom.setAnimation("mushroom");` Line 9: The sprite velocity is set here. `mushroom.velocityX = -5;` Line 10: Another sprite is defined here. `var fly = createSprite(475, randomNumber(175, 325));` Line 11: The sprite animation is set here. `fly.setAnimation("fly");` Line 12: The sprite velocity is set here. `fly.velocityY = -7;`',
  'Algorithms and Control - Player Control Conditionals':
    'Line 38: The jumping conditionals are set here. `if (frog.y > 324) {` `if (keyDown("up")) {` `frog.velocityY = -5;` `} else {` `frog.velocityY = 0;` `}` `}`',
  'Algorithms and Control - Looping Conditionals':
    'Line 49: The looping conditional is set here. `if (mushroom.x < -30) {` `mushroom.x = 430;` `}`',
  'Algorithms and Control - Interaction Conditionals':
    'No observations related to sprite interactions.',
  Variables:
    'Line 16: The variables are defined here. `var score = 0;` `var health = 100;` Line 57: The scoreboard is added here. `fill("black");` `textSize(20);` `text("Health:", 280, 30);` `text (health, 350, 30);`',
};

const TAB_NAMES = {
  RUBRIC: 'rubric',
  SETTINGS: 'settings',
};

export default function RubricContainer({
  rubric,
  studentLevelInfo,
  teacherHasEnabledAi,
  currentLevelName,
  reportingData,
  open,
  closeRubric,
  sectionId,
}) {
  const onLevelForEvaluation = currentLevelName === rubric.level.name;
  const canProvideFeedback = !!studentLevelInfo && onLevelForEvaluation;

  const [selectedTab, setSelectedTab] = useState(TAB_NAMES.RUBRIC);
  const [aiEvaluations, setAiEvaluations] = useState(null);

  const tabSelectCallback = tabSelection => {
    setSelectedTab(tabSelection);
  };

  const fetchAiEvaluations = useCallback(() => {
    if (!!studentLevelInfo && teacherHasEnabledAi) {
      const studentId = studentLevelInfo.user_id;
      const rubricId = rubric.id;
      const dataUrl = `/rubrics/${rubricId}/get_ai_evaluations?student_id=${studentId}`;

      fetch(dataUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // TODO: XXX: add throwaway line annotations
          data.forEach(learningGoalEvaluation => {
            rubric.learningGoals.forEach(learningGoal => {
              if (learningGoalEvaluation.learning_goal_id === learningGoal.id) {
                if (THROWAWAY_LINE_ANNOTATIONS[learningGoal.learningGoal]) {
                  learningGoalEvaluation.observations =
                    THROWAWAY_LINE_ANNOTATIONS[learningGoal.learningGoal];
                }
              }
            });
          });
          setAiEvaluations(data);
        })
        .catch(error => {
          console.log(
            'There was a problem with the fetch operation:',
            error.message
          );
        });
    }
  }, [studentLevelInfo, teacherHasEnabledAi, rubric.id, rubric.learningGoals]);

  useEffect(() => {
    fetchAiEvaluations();
  }, [fetchAiEvaluations]);

  // Currently the settings tab only provides a way to manually run AI.
  // In the future, we should update or remove this conditional when we
  // add more functionality to the settings tab.
  const showSettings = canProvideFeedback && teacherHasEnabledAi;

  return (
    <div
      className={classnames(style.rubricContainer, {
        [style.hiddenRubricContainer]: !open,
      })}
    >
      <div
        className={
          experiments.isEnabled('ai-rubrics-redesign')
            ? style.rubricHeaderRedesign
            : style.rubricHeader
        }
      >
        {!experiments.isEnabled('ai-rubrics-redesign') && (
          <div className={style.rubricHeaderLeftSide}>
            <HeaderTab
              text={i18n.rubric()}
              isSelected={selectedTab === TAB_NAMES.RUBRIC}
              onClick={() => setSelectedTab(TAB_NAMES.RUBRIC)}
            />
            {showSettings && (
              <HeaderTab
                text={i18n.settings()}
                isSelected={selectedTab === TAB_NAMES.SETTINGS}
                onClick={() => setSelectedTab(TAB_NAMES.SETTINGS)}
              />
            )}
          </div>
        )}
        <div className={style.rubricHeaderRightSide}>
          <button
            type="button"
            onClick={closeRubric}
            className={classnames(style.buttonStyle, style.closeButton)}
          >
            <FontAwesome icon="xmark" />
          </button>
        </div>
      </div>

      <div
        className={classnames({
          [style.fabBackground]: experiments.isEnabled('ai-rubrics-redesign'),
        })}
      >
        {experiments.isEnabled('ai-rubrics-redesign') && (
          <RubricTabButtons
            tabSelectCallback={tabSelectCallback}
            selectedTab={selectedTab}
            showSettings={showSettings}
            canProvideFeedback={canProvideFeedback}
            teacherHasEnabledAi={teacherHasEnabledAi}
            studentUserId={studentLevelInfo && studentLevelInfo['user_id']}
            refreshAiEvaluations={fetchAiEvaluations}
            rubric={rubric}
            studentName={studentLevelInfo && studentLevelInfo.name}
          />
        )}

        <RubricContent
          rubric={rubric}
          open={open}
          studentLevelInfo={studentLevelInfo}
          teacherHasEnabledAi={teacherHasEnabledAi}
          canProvideFeedback={canProvideFeedback}
          onLevelForEvaluation={onLevelForEvaluation}
          reportingData={reportingData}
          visible={selectedTab === TAB_NAMES.RUBRIC}
          aiEvaluations={aiEvaluations}
        />
        {showSettings && (
          <RubricSettings
            canProvideFeedback={canProvideFeedback}
            teacherHasEnabledAi={teacherHasEnabledAi}
            studentUserId={studentLevelInfo && studentLevelInfo['user_id']}
            visible={selectedTab === TAB_NAMES.SETTINGS}
            refreshAiEvaluations={fetchAiEvaluations}
            rubric={rubric}
            studentName={studentLevelInfo && studentLevelInfo.name}
            sectionId={sectionId}
          />
        )}
      </div>
    </div>
  );
}

RubricContainer.propTypes = {
  rubric: rubricShape,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  teacherHasEnabledAi: PropTypes.bool,
  currentLevelName: PropTypes.string,
  closeRubric: PropTypes.func,
  open: PropTypes.bool,
  sectionId: PropTypes.number,
};

const HeaderTab = ({text, isSelected, onClick}) => {
  return (
    <button
      className={classnames(
        'uitest-rubric-header-tab',
        style.rubricHeaderTab,
        style.buttonStyle,
        {
          [style.selectedTab]: isSelected,
          [style.unselectedTab]: !isSelected,
        }
      )}
      onClick={onClick}
      type="button"
    >
      <Heading6>{text}</Heading6>
    </button>
  );
};

HeaderTab.propTypes = {
  text: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

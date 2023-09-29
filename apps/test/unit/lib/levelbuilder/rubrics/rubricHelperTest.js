import {
  saveRubricToTable,
  SAVING_TEXT,
  SAVE_COMPLETED_TEXT,
  RUBRIC_PATH,
} from '@cdo/apps/lib/levelbuilder/rubrics/rubricHelper';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import sinon from 'sinon';

describe('rubricHelperTest.js', () => {
  const learningGoalList = [
    {
      key: 'ui-1',
      id: 100,
      learningGoal: '',
      aiEnabled: false,
      position: 1,
      learningGoalEvidenceLevelsAttributes: [
        {
          teacherDescription: '',
          understanding: RubricUnderstandingLevels.NONE,
          aiPrompt: '',
        },
      ],
    },
    {
      key: 'ui-2',
      id: 'ui-2',
      learningGoal: '',
      aiEnabled: false,
      position: 2,
      learningGoalEvidenceLevelsAttributes: [
        {
          teacherDescription: '',
          understanding: RubricUnderstandingLevels.NONE,
          aiPrompt: '',
        },
      ],
    },
  ];
  const lessonId = 3;
  const selectedLevelForAssessment = 2;
  const rubricInfo = {
    id: 1,
    learningGoals: [
      {
        key: 'ui-1',
        id: 100,
        learningGoal: '',
        aiEnabled: false,
        position: 1,
        learningGoalEvidenceLevelsAttributes: [
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.NONE,
            aiPrompt: '',
          },
        ],
      },
    ],
  };

  it('shows notification of updated rubric', async () => {
    const setSaveNotificationText = sinon.stub();
    const mockFetch = sinon.stub(global, 'fetch');
    mockFetch.returns(
      Promise.resolve(new Response(JSON.stringify({redirectUrl: 'test_url'})))
    );

    await saveRubricToTable(
      setSaveNotificationText,
      rubricInfo,
      learningGoalList,
      selectedLevelForAssessment,
      lessonId
    );

    sinon.assert.calledWith(mockFetch, `/rubrics/${rubricInfo.id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json', 'X-CSRF-Token': null},
      body: '{"levelId":2,"lessonId":3,"learningGoalsAttributes":[{"key":"ui-1","id":100,"learning_goal":"","ai_enabled":false,"position":1,"learning_goal_evidence_levels_attributes":[{"teacher_description":"","understanding":0,"ai_prompt":""}]},{"key":"ui-2","learning_goal":"","ai_enabled":false,"position":2,"learning_goal_evidence_levels_attributes":[{"teacher_description":"","understanding":0,"ai_prompt":""}]}]}',
    });
    sinon.assert.calledWithExactly(
      setSaveNotificationText.getCall(0),
      SAVING_TEXT
    );
    sinon.assert.calledWithExactly(
      setSaveNotificationText.getCall(1),
      SAVE_COMPLETED_TEXT
    );
    sinon.restore();
  });

  it('redirects when creating a new rubric', async () => {
    const setSaveNotificationText = sinon.stub();
    const mockFetch = sinon.stub(global, 'fetch');
    mockFetch.returns(
      Promise.resolve(new Response(JSON.stringify({redirectUrl: 'test_url'})))
    );

    await saveRubricToTable(
      setSaveNotificationText,
      null,
      learningGoalList,
      selectedLevelForAssessment,
      lessonId
    );

    sinon.assert.calledWith(mockFetch, RUBRIC_PATH, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-CSRF-Token': null},
      body: '{"levelId":2,"lessonId":3,"learningGoalsAttributes":[{"key":"ui-1","id":100,"learning_goal":"","ai_enabled":false,"position":1,"learning_goal_evidence_levels_attributes":[{"teacher_description":"","understanding":0,"ai_prompt":""}]},{"key":"ui-2","learning_goal":"","ai_enabled":false,"position":2,"learning_goal_evidence_levels_attributes":[{"teacher_description":"","understanding":0,"ai_prompt":""}]}]}',
    });

    sinon.assert.calledWithExactly(
      setSaveNotificationText.getCall(0),
      SAVING_TEXT
    );
    sinon.restore();
  });
});

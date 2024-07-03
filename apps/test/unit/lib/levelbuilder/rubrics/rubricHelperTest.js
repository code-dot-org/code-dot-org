import {
  saveRubricToTable,
  SAVING_TEXT,
  RUBRIC_PATH,
  SAVE_COMPLETED_TEXT,
} from '@cdo/apps/lib/levelbuilder/rubrics/rubricHelper';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';

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

  it('shows notification of saving updates to an exisiting rubric', async () => {
    const setSaveNotificationText = jest.fn();
    const setLearningGoalList = jest.fn();

    const mockFetch = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
    mockFetch.mockReturnValue(
      Promise.resolve(new Response(JSON.stringify({redirectUrl: 'test_url'})))
    );

    const mockTimeout = jest.spyOn(window, 'setTimeout').mockClear().mockImplementation((f, n) => {
      f();
    });

    await saveRubricToTable(
      setSaveNotificationText,
      rubricInfo,
      learningGoalList,
      setLearningGoalList,
      selectedLevelForAssessment,
      lessonId
    );

    expect(mockFetch).toHaveBeenCalledWith(`/rubrics/${rubricInfo.id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json', 'X-CSRF-Token': null},
      body: '{"levelId":2,"lessonId":3,"learningGoalsAttributes":[{"key":"ui-1","id":100,"learning_goal":"","ai_enabled":false,"position":1,"learning_goal_evidence_levels_attributes":[{"teacher_description":"","understanding":0,"ai_prompt":""}]},{"key":"ui-2","learning_goal":"","ai_enabled":false,"position":2,"learning_goal_evidence_levels_attributes":[{"teacher_description":"","understanding":0,"ai_prompt":""}]}]}',
    });
    sinon.assert.calledWithExactly(
      setSaveNotificationText.mock.calls[0],
      SAVING_TEXT
    );
    sinon.assert.calledWithExactly(
      setSaveNotificationText.mock.calls[1],
      SAVE_COMPLETED_TEXT
    );
    sinon.assert.calledWithExactly(setSaveNotificationText.mock.calls[2], '');
    sinon.assert.calledOnceWithExactly(mockTimeout, expect.anything(), 8500);
    jest.restoreAllMocks();
  });

  it('redirects when creating a new rubric', async () => {
    const setSaveNotificationText = jest.fn();
    const setLearningGoalList = jest.fn();
    const mockFetch = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
    mockFetch.mockReturnValue(
      Promise.resolve(new Response(JSON.stringify({redirectUrl: 'test_url'})))
    );

    await saveRubricToTable(
      setSaveNotificationText,
      null,
      learningGoalList,
      setLearningGoalList,
      selectedLevelForAssessment,
      lessonId
    );

    expect(mockFetch).toHaveBeenCalledWith(RUBRIC_PATH, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-CSRF-Token': null},
      body: '{"levelId":2,"lessonId":3,"learningGoalsAttributes":[{"key":"ui-1","id":100,"learning_goal":"","ai_enabled":false,"position":1,"learning_goal_evidence_levels_attributes":[{"teacher_description":"","understanding":0,"ai_prompt":""}]},{"key":"ui-2","learning_goal":"","ai_enabled":false,"position":2,"learning_goal_evidence_levels_attributes":[{"teacher_description":"","understanding":0,"ai_prompt":""}]}]}',
    });

    sinon.assert.calledWithExactly(
      setSaveNotificationText.mock.calls[0],
      SAVING_TEXT
    );
    jest.restoreAllMocks();
  });
});

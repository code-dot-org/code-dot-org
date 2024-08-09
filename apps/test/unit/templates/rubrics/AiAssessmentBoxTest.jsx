import {render, screen, act, fireEvent} from '@testing-library/react';
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import EditorAnnotator from '@cdo/apps/EditorAnnotator';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import AiAssessmentBox from '@cdo/apps/templates/rubrics/AiAssessmentBox';
import AiAssessmentFeedbackContext, {
  NO_FEEDBACK,
  THUMBS_UP,
  THUMBS_DOWN,
} from '@cdo/apps/templates/rubrics/AiAssessmentFeedbackContext';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

async function wait() {
  await act(async () => Promise.resolve());
}

describe('AiAssessmentBox', () => {
  const reportingData = {
    unitName: 'test-2023',
    courseName: 'course-2023',
    levelName: 'Test Blah Blah Blah',
  };
  const mockAiInfo = {
    id: 33,
    learning_goal_id: 44,
    understanding: 2,
    aiConfidencePassFail: 2,
  };
  const mockEvidence = [
    {
      firstLine: 1,
      lastLine: 10,
      message: 'This is evidence.',
    },
    {
      firstLine: 42,
      lastLine: 45,
      message: 'This is some other evidence.',
    },
  ];
  const mockEvidenceWithoutLines = [
    {
      message: 'This is the original observations.',
    },
    {
      message: 'This is another line.',
    },
    {
      message: 'This is a third line.',
    },
  ];
  const props = {
    isAiAssessed: true,
    studentName: 'Jane Doe',
    learningGoals: [{key: 'key', learningGoal: 'goal'}],
    currentLearningGoal: 0,
    reportingData: reportingData,
    aiUnderstandingLevel: RubricUnderstandingLevels.CONVINCING,
    aiConfidence: 1,
    aiEvalInfo: mockAiInfo,
    aiEvidence: mockEvidence,
    studentLevelInfo: {name: 'student', user_id: 42},
  };
  let mockSetAiFeedback;
  beforeEach(() => {
    mockSetAiFeedback = jest.fn(() => {});
  });
  it('renders AiAssessmentBox with student information if it is assessed by AI', () => {
    render(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    screen.getByText(
      i18n.aiStudentAssessment({
        studentName: props.studentName,
        understandingLevel: i18n.aiAssessmentDoesMeet(),
      })
    );
  });

  it('renders AiAssessmentBox with AiConfidenceBox when available', () => {
    render(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    screen.getByText(i18n.aiConfidence({aiConfidence: i18n.low()}));
  });

  it('renders AiAssessmentBox without AiConfidenceBox when unavailable', () => {
    const updatedProps = {
      ...props,
      aiConfidence: null,
    };
    render(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...updatedProps} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(screen.queryByText('AI Confidence')).toBeNull();
  });

  it('should render associated message for aiAssessed with convincing understanding', () => {
    render(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );

    screen.getByText(
      i18n.aiStudentAssessment({
        studentName: props.studentName,
        understandingLevel: i18n.aiAssessmentDoesMeet(),
      })
    );
  });

  it('should render associated message for aiAssessed with limited understanding', () => {
    const updatedProps = {
      ...props,
      aiUnderstandingLevel: RubricUnderstandingLevels.LIMITED,
    };
    render(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...updatedProps} />
      </AiAssessmentFeedbackContext.Provider>
    );
    screen.getByText(
      i18n.aiStudentAssessment({
        studentName: props.studentName,
        understandingLevel: i18n.aiAssessmentDoesNotMeet(),
      })
    );
  });

  it('renders AiAssessmentBox with notice that AI cannot be used when the topic is too subjective to be evaluated', () => {
    const updatedProps = {...props, isAiAssessed: false};
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...updatedProps} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('BodyThreeText')).toHaveLength(0);
    expect(wrapper.find('EmText')).toHaveLength(1);
    expect(wrapper.html().includes(i18n.aiCannotAssess())).toBe(true);
  });

  it('renders no evidence if none is given', () => {
    const updatedProps = {...props, aiEvidence: []};
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...updatedProps} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('ul li')).toHaveLength(0);
    expect(wrapper.html().includes(props.aiEvidence[0].message)).toBe(false);
  });

  it('renders evidence when given', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('ul li')).toHaveLength(2);
    expect(wrapper.html().includes(props.aiEvidence[0].message)).toBe(true);

    // Expect that lines are present
    expect(wrapper.html().includes(`Lines`)).toBe(true);

    // And we expect two links for each line for a total of 4 links
    expect(wrapper.find('ul li p a')).toHaveLength(4);
  });

  it('falls back to rendering evidence as observations if there is no line numbers', () => {
    const updatedProps = {...props, aiEvidence: mockEvidenceWithoutLines};
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...updatedProps} />
      </AiAssessmentFeedbackContext.Provider>
    );
    // Still one list item per evidence provided.
    expect(wrapper.find('ul li')).toHaveLength(3);
    // We expect no links
    expect(wrapper.find('ul li p a')).toHaveLength(0);
    // And it should not render line numbers in this case since it does not know
    // where any particular observation actually is.
    expect(wrapper.html().includes(`Lines`)).toBe(false);
  });

  it('navigates to the line when the evidence link for a line number is activated', () => {
    const scrollToLineStub = jest
      .spyOn(EditorAnnotator, 'scrollToLine')
      .mockClear()
      .mockImplementation();

    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );

    // The first link should be the first line number mentioned in the evidence list.
    const lineNumber = mockEvidence[0].firstLine;

    // Find the links and expect clicking on them actives scrolling
    const link = wrapper.find('ul li p a').first();

    // Click on it
    link.simulate('click');

    // Check that we called the editor annotator to scroll to the line we want.
    expect(scrollToLineStub).toHaveBeenCalledWith(lineNumber);

    // Restore stubs
    scrollToLineStub.mockRestore();
  });

  it('should send an event when the evidence link is clicked', () => {
    const sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();
    const eventName = EVENTS.TA_RUBRIC_EVIDENCE_GOTO_CLICKED;
    const scrollToLineStub = jest
      .spyOn(EditorAnnotator, 'scrollToLine')
      .mockClear()
      .mockImplementation();

    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );

    // Find the links and expect clicking on them actives scrolling
    const link = wrapper.find('ul li p a').first();

    // Click on it
    link.simulate('click');

    // Check that we sent the event
    expect(sendEventSpy).toHaveBeenCalledWith(eventName, {
      ...reportingData,
      learningGoalKey: props.learningGoals[props.currentLearningGoal].key,
      learningGoal: props.learningGoals[props.currentLearningGoal].learningGoal,
      studentId: 42,
    });

    // Restore stubs
    scrollToLineStub.mockRestore();
    sendEventSpy.mockRestore();
  });

  it('sends an event when thumbs up is clicked', async () => {
    render(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );

    const fetchStub = jest.spyOn(window, 'fetch');

    fetchStub.mockImplementation((endpoint, options) => {
      if (endpoint === '/get_token') {
        return Promise.resolve(
          new Response('', {
            headers: {'csrf-token': 'token'},
          })
        );
      } else if (
        endpoint === '/learning_goal_ai_evaluation_feedbacks' &&
        options['method'] === 'POST'
      ) {
        return Promise.resolve(new Response(JSON.stringify({id: 999})));
      }
    });

    const thumbsUpButton = screen.getByTestId('thumbs-o-up');
    fireEvent.click(thumbsUpButton);

    await wait();

    const expectedBody = JSON.stringify({
      learningGoalAiEvaluationId: 33,
      aiFeedbackApproval: THUMBS_UP,
    });
    expect(fetchStub).toHaveBeenCalledWith(
      '/learning_goal_ai_evaluation_feedbacks',
      {
        body: expectedBody,
        headers: {'Content-Type': 'application/json', 'X-CSRF-TOKEN': 'token'},
        method: 'POST',
      }
    );

    fetchStub.mockRestore();
  });

  it('sends an event when thumbs down is clicked', async () => {
    render(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );

    const fetchStub = jest.spyOn(window, 'fetch');

    fetchStub.mockImplementation((endpoint, options) => {
      if (endpoint === '/get_token') {
        return Promise.resolve(
          new Response('', {
            headers: {'csrf-token': 'token'},
          })
        );
      } else if (
        endpoint === '/learning_goal_ai_evaluation_feedbacks' &&
        options['method'] === 'POST'
      ) {
        return Promise.resolve(new Response(JSON.stringify({id: 999})));
      }
    });

    const thumbsUpButton = screen.getByTestId('thumbs-o-down');
    fireEvent.click(thumbsUpButton);

    await wait();

    const expectedBody = JSON.stringify({
      learningGoalAiEvaluationId: 33,
      aiFeedbackApproval: THUMBS_DOWN,
    });
    expect(fetchStub).toHaveBeenCalledWith(
      '/learning_goal_ai_evaluation_feedbacks',
      {
        body: expectedBody,
        headers: {'Content-Type': 'application/json', 'X-CSRF-TOKEN': 'token'},
        method: 'POST',
      }
    );

    fetchStub.mockRestore();
  });

  it('updates the thumbs down event when survey is submitted', async () => {
    const {rerender} = render(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );

    const fetchStub = jest.spyOn(window, 'fetch');

    fetchStub.mockImplementation((endpoint, options) => {
      if (endpoint === '/get_token') {
        return Promise.resolve(
          new Response('', {
            headers: {'csrf-token': 'token'},
          })
        );
      } else if (
        endpoint === '/learning_goal_ai_evaluation_feedbacks' &&
        options['method'] === 'POST'
      ) {
        return Promise.resolve(new Response(JSON.stringify({id: 999})));
      } else if (
        endpoint === '/learning_goal_ai_evaluation_feedbacks/999' &&
        options['method'] === 'PUT'
      ) {
        return Promise.resolve(new Response(''));
      }
    });

    // survey not visible
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);

    expect(mockSetAiFeedback).toHaveBeenCalledTimes(0);

    const thumbsUpButton = screen.getByTestId('thumbs-o-down');
    fireEvent.click(thumbsUpButton);

    await wait();

    // manually propagate the aiFeedback state change. this is normally done by
    // the LearningGoals component.
    expect(mockSetAiFeedback).toHaveBeenCalledWith(THUMBS_DOWN);
    rerender(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: THUMBS_DOWN, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );

    // survey is visible
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);

    // click checkbox
    const checkbox = screen.getByRole('checkbox', {
      name: i18n.aiFeedbackFalsePos(),
    });
    fireEvent.click(checkbox);

    // click submit button
    const submitButton = screen.getByRole('button', {
      name: i18n.aiFeedbackSubmit(),
    });
    fireEvent.click(submitButton);
    await wait();

    const expectedBody = {
      learningGoalAiEvaluationId: 33,
      aiFeedbackApproval: 0,
      falsePositive: true,
      falseNegative: false,
      Vague: false,
      feedbackOther: false,
      otherContent: '',
    };
    expect(fetchStub).toHaveBeenCalledWith(
      `/learning_goal_ai_evaluation_feedbacks/999`,
      {
        body: JSON.stringify(expectedBody),
        headers: {'Content-Type': 'application/json', 'X-CSRF-TOKEN': 'token'},
        method: 'PUT',
      }
    );

    fetchStub.mockRestore();
  });
});

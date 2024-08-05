import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import EditorAnnotator from '@cdo/apps/EditorAnnotator';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import AiAssessmentBox from '@cdo/apps/templates/rubrics/AiAssessmentBox';
import AiAssessmentFeedbackContext, {
  NO_FEEDBACK,
} from '@cdo/apps/templates/rubrics/AiAssessmentFeedbackContext';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

describe('AiAssessmentBox', () => {
  const reportingData = {
    unitName: 'test-2023',
    courseName: 'course-2023',
    levelName: 'Test Blah Blah Blah',
  };
  const mockAiInfo = {
    id: 2,
    learning_goal_id: 2,
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
  const mockSetAiFeedback = () => {};
  const props = {
    isAiAssessed: true,
    studentName: 'Jane Doe',
    learningGoals: [{key: 'key', learningGoal: 'goal'}],
    currentLearningGoal: 0,
    reportingData: reportingData,
    aiUnderstandingLevel: RubricUnderstandingLevels.CONVINCING,
    aiConfidence: 70,
    aiEvalInfo: mockAiInfo,
    aiEvidence: mockEvidence,
    studentLevelInfo: {name: 'student', user_id: 42},
  };

  it('renders AiAssessmentBox with student information if it is assessed by AI', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('BodyFourText StrongText + span').first().text()).toBe(
      i18n.aiStudentAssessment({
        studentName: props.studentName,
        understandingLevel: i18n.aiAssessmentDoesMeet(),
      })
    );
  });

  it('renders AiAssessmentBox with AiConfidenceBox when available', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('AiConfidenceBox')).toHaveLength(1);
  });

  it('renders AiAssessmentBox without AiConfidenceBox when unavailable', () => {
    const updatedProps = {
      ...props,
      aiConfidence: null,
    };
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...updatedProps} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('AiConfidenceBox')).toHaveLength(0);
  });

  it('should render associated message for aiAssessed with convincing understanding', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );

    expect(
      wrapper.html().includes(
        i18n.aiStudentAssessment({
          studentName: props.studentName,
          understandingLevel: i18n.aiAssessmentDoesMeet(),
        })
      )
    ).toBe(true);
  });

  it('should render associated message for aiAssessed with limited understanding', () => {
    const updatedProps = {
      ...props,
      aiUnderstandingLevel: RubricUnderstandingLevels.LIMITED,
    };
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider
        value={{aiFeedback: NO_FEEDBACK, setAiFeedback: mockSetAiFeedback}}
      >
        <AiAssessmentBox {...updatedProps} />
      </AiAssessmentFeedbackContext.Provider>
    );

    expect(
      wrapper.html().includes(
        i18n.aiStudentAssessment({
          studentName: props.studentName,
          understandingLevel: i18n.aiAssessmentDoesNotMeet(),
        })
      )
    ).toBe(true);
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
});

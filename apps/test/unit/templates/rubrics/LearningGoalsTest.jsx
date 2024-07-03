import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {act} from 'react-dom/test-utils';

import EditorAnnotator from '@cdo/apps/EditorAnnotator';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import tipIconImage from '@cdo/apps/templates/rubrics/images/AiBot_Icon.svg';
import infoIconImage from '@cdo/apps/templates/rubrics/images/info-icon.svg';
import LearningGoals, {
  clearAnnotations,
  annotateLines,
} from '@cdo/apps/templates/rubrics/LearningGoals';
import HttpClient from '@cdo/apps/util/HttpClient';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';



// These are test observations that would be given by the AI.
const observations = 'This is an observation. This is another observation.';

const learningGoals = [
  {
    id: 2,
    key: 'abcd',
    learningGoal: 'Learning Goal 1',
    aiEnabled: true,
    evidenceLevels: [
      {id: 10, understanding: 0, teacherDescription: 'lg one none'},
      {id: 11, understanding: 1, teacherDescription: 'lg one limited'},
      {id: 12, understanding: 2, teacherDescription: 'lg one convincing'},
      {id: 13, understanding: 3, teacherDescription: 'lg one extensive'},
    ],
    tips: 'Tips',
  },
  {
    id: 3,
    key: 'efgh',
    learningGoal: 'Learning Goal 2',
    aiEnabled: false,
    evidenceLevels: [
      {id: 10, understanding: 0, teacherDescription: 'lg two none'},
      {id: 11, understanding: 1, teacherDescription: 'lg two limited'},
      {id: 12, understanding: 2, teacherDescription: 'lg two convincing'},
      {id: 13, understanding: 3, teacherDescription: 'lg two extensive'},
    ],
    tips: 'Tips',
  },
];

const submittedEvaluation = {
  feedback: 'test feedback',
  understanding: RubricUnderstandingLevels.LIMITED,
};

const aiEvaluations = [
  {
    id: 2,
    learning_goal_id: 2,
    understanding: 2,
    aiConfidencePassFail: 2,
    aiConfidenceExactMatch: 1,
    observations: observations,
    evidence:
      'Line 3-5: The sprite is defined here. `var sprite = createSprite(100, 120)`',
  },
  {
    id: 3,
    learning_goal_id: 3,
    understanding: 2,
    aiConfidencePassFail: 2,
    aiConfidenceExactMatch: 1,
    observations: observations,
    evidence:
      'Line 7-9: Some other sprite is defined here. `var sprite = createSprite(200, 240)`',
  },
];

const code = `// code
    var x = 5;
    var y = 6;
    // add them together
    /*
    var z = x + y;
    */
    draw();

    if (something) {
      doSomething();
    }

    exit();
  `;

const studentLevelInfo = {
  user_id: 1,
  name: 'Stella',
  attempts: 3,
  timeSpent: 100,
  lastAttempt: '2024-03-02',
};

const reportingData = {
  unitName: 'test-2023',
  courseName: 'course-2023',
  levelName: 'Test Blah Blah Blah',
};

describe('LearningGoals - React Testing Library', () => {
  let annotatorStub,
    annotateLineStub,
    scrollToLineStub,
    highlightLineStub,
    clearAnnotationsStub,
    clearHighlightedLinesStub;

  // Stub out our references to the singleton and editor
  beforeEach(() => {
    let annotatorInstanceStub = jest.fn();
    annotatorInstanceStub.getCode = jest.fn().mockReturnValue(code);
    annotatorStub = jest.spyOn(EditorAnnotator, 'annotator').mockClear()
      .mockReturnValue(annotatorInstanceStub);
    annotateLineStub = jest.spyOn(EditorAnnotator, 'annotateLine').mockClear().mockImplementation();
    scrollToLineStub = jest.spyOn(EditorAnnotator, 'scrollToLine').mockClear().mockImplementation();
    clearAnnotationsStub = jest.spyOn(EditorAnnotator, 'clearAnnotations').mockClear().mockImplementation();
    highlightLineStub = jest.spyOn(EditorAnnotator, 'highlightLine').mockClear().mockImplementation();
    clearHighlightedLinesStub = jest.spyOn(EditorAnnotator, 'clearHighlightedLines').mockClear().mockImplementation();
  });
  afterEach(() => {
    annotatorStub.mockRestore();
    scrollToLineStub.mockRestore();
    annotateLineStub.mockRestore();
    clearAnnotationsStub.mockRestore();
    highlightLineStub.mockRestore();
    clearHighlightedLinesStub.mockRestore();
  });

  it('renders EvidenceLevels without canProvideFeedback', () => {
    render(<LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />);

    // This text only shows up within EvidenceLevels when canProvideFeedback is false
    expect(screen.getByText('Rubric Scores')).toBeDefined();

    // First learning goal is visible
    expect(screen.getByText('Learning Goal 1')).toBeDefined();
    expect(screen.getByText(/lg one none/)).toBeDefined();
    expect(screen.getByText(/lg one limited/)).toBeDefined();
    expect(screen.getByText(/lg one convincing/)).toBeDefined();
    expect(screen.getByText(/lg one extensive/)).toBeDefined();
  });

  it('scrolls to the first line of evidence when the learning goal is selected', async () => {
    render(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={true}
        aiUnderstanding={3}
        studentLevelInfo={studentLevelInfo}
        aiEvaluations={aiEvaluations}
      />
    );

    const user = userEvent.setup();

    expect(scrollToLineStub).toHaveBeenCalledWith(3);

    const button = screen.getByRole('button', {
      name: i18n.rubricNextLearningGoal(),
    });
    await user.click(button);

    expect(scrollToLineStub).toHaveBeenCalledWith(7);
  });

  it('does not scroll anywhere when the evidence is blank', async () => {
    const myAiEvaluations = [
      {
        ...aiEvaluations[0],
        evidence: '',
      },
      {
        ...aiEvaluations[1],
        evidence: '',
      },
    ];

    render(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={true}
        aiUnderstanding={3}
        studentLevelInfo={studentLevelInfo}
        aiEvaluations={myAiEvaluations}
      />
    );

    const user = userEvent.setup();
    const button = screen.getByRole('button', {
      name: i18n.rubricNextLearningGoal(),
    });
    await user.click(button);

    expect(scrollToLineStub).not.toHaveBeenCalled();
  });

  describe('when aiConfidenceExactMatch is high', () => {
    const myAiEvaluations = [
      {
        ...aiEvaluations[0],
        aiConfidenceExactMatch: 3,
      },
    ];
    it('highlights one bubble', () => {
      render(
        <LearningGoals
          learningGoals={learningGoals}
          aiEvaluations={myAiEvaluations}
          studentLevelInfo={studentLevelInfo}
          teacherHasEnabledAi
          canProvideFeedback
        />
      );
      expect(getSuggestedButtonNames()).toEqual(['Convincing']);
    });
    it('shows only one evaluation level in written summary', () => {
      render(
        <LearningGoals
          learningGoals={learningGoals}
          aiEvaluations={myAiEvaluations}
          studentLevelInfo={studentLevelInfo}
          teacherHasEnabledAi
          canProvideFeedback
        />
      );
      screen.getByText(
        'Stella has achieved Convincing Evidence for this learning goal.'
      );
    });
    it('shows exact-match confidence level', () => {
      render(
        <LearningGoals
          learningGoals={learningGoals}
          aiEvaluations={myAiEvaluations}
          studentLevelInfo={studentLevelInfo}
          teacherHasEnabledAi
          canProvideFeedback
        />
      );
      screen.getByText('AI Confidence: high');
    });
  });

  describe('when aiConfidenceExactMatch is low', () => {
    it('highlights two bubbles', () => {
      render(
        <LearningGoals
          learningGoals={learningGoals}
          aiEvaluations={aiEvaluations}
          studentLevelInfo={studentLevelInfo}
          teacherHasEnabledAi
          canProvideFeedback
        />
      );
      expect(getSuggestedButtonNames().sort()).toEqual(['Convincing', 'Extensive'].sort());
    });
    it('shows two evaluation levels in written summary', () => {
      render(
        <LearningGoals
          learningGoals={learningGoals}
          aiEvaluations={aiEvaluations}
          studentLevelInfo={studentLevelInfo}
          teacherHasEnabledAi
          canProvideFeedback
        />
      );
      screen.getByText(
        'Stella has achieved Extensive or Convincing Evidence for this learning goal.'
      );
    });
    it('shows pass-fail confidence level', () => {
      render(
        <LearningGoals
          learningGoals={learningGoals}
          aiEvaluations={aiEvaluations}
          studentLevelInfo={studentLevelInfo}
          teacherHasEnabledAi
          canProvideFeedback
        />
      );
      screen.getByText('AI Confidence: medium');
    });
  });

  it('should send an event if the annotation tooltip is hovered', () => {
    const sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();

    // We need to check that the callback we give to the annotator would create
    // the event report.
    let hoverCallback = undefined;
    annotateLineStub.callsFake((a, b, c, d, e, f, callback) => {
      hoverCallback = callback;
    });

    render(
      <LearningGoals
        learningGoals={learningGoals}
        aiEvaluations={aiEvaluations}
        reportingData={reportingData}
        studentLevelInfo={studentLevelInfo}
        teacherHasEnabledAi
        canProvideFeedback
      />
    );

    const evidence = /The sprite is defined here/;
    screen.getByText(evidence);

    // There should be /some/ kind of callback registered
    expect(hoverCallback).toBeDefined();

    // Call the callback ourselves
    hoverCallback({});

    // We should have triggered the sending of the event with the given data.
    const eventName = EVENTS.TA_RUBRIC_EVIDENCE_TOOLTIP_HOVERED;
    expect(sendEventSpy).toHaveBeenCalledWith(eventName, {
      ...reportingData,
      learningGoalKey: learningGoals[0].key,
      learningGoal: learningGoals[0].learningGoal,
      studentId: studentLevelInfo.user_id,
    });

    // Restore stubs
    sendEventSpy.mockRestore();
  });
});

function getSuggestedButtonNames() {
  const allButtons = screen.getAllByRole('button');
  const suggestedButtons = allButtons.filter(button =>
    button.classList.contains('unittest-evidence-level-suggested')
  );
  return suggestedButtons.map(button => button.textContent);
}

describe('LearningGoals - Enzyme', () => {
  let annotatorStub,
    annotateLineStub,
    scrollToLineStub,
    highlightLineStub,
    clearAnnotationsStub,
    clearHighlightedLinesStub;
  const studentLevelInfo = {name: 'Grace Hopper', timeSpent: 706, user_id: 1};

  function stubAnnotator() {
    // Stub out our references to the singleton and editor
    let annotatorInstanceStub = jest.fn();
    annotatorInstanceStub.getCode = jest.fn().mockReturnValue(code);
    annotatorStub = jest.spyOn(EditorAnnotator, 'annotator').mockClear()
      .mockReturnValue(annotatorInstanceStub);
    annotateLineStub = jest.spyOn(EditorAnnotator, 'annotateLine').mockClear().mockImplementation();
    scrollToLineStub = jest.spyOn(EditorAnnotator, 'scrollToLine').mockClear().mockImplementation();
    clearAnnotationsStub = jest.spyOn(EditorAnnotator, 'clearAnnotations').mockClear().mockImplementation();
    highlightLineStub = jest.spyOn(EditorAnnotator, 'highlightLine').mockClear().mockImplementation();
    clearHighlightedLinesStub = jest.spyOn(EditorAnnotator, 'clearHighlightedLines').mockClear().mockImplementation();
  }

  function restoreAnnotator() {
    annotatorStub.mockRestore();
    scrollToLineStub.mockRestore();
    annotateLineStub.mockRestore();
    clearAnnotationsStub.mockRestore();
    highlightLineStub.mockRestore();
    clearHighlightedLinesStub.mockRestore();
  }

  describe('annotateLines', () => {
    beforeEach(() => {
      stubAnnotator();
    });
    afterEach(() => {
      restoreAnnotator();
    });

    it('should do nothing if the AI observation does not reference any lines', () => {
      // The AI tends to misreport the line number, so we shouldn't rely on it
      annotateLines('This is just a basic observation.', observations);
      expect(annotateLineStub).not.toHaveBeenCalled();
    });

    it('should annotate a single line of code referenced by the AI', () => {
      // The AI tends to misreport the line number, so we shouldn't rely on it
      annotateLines(
        'Line 1: This is a line of code `var x = 5;`',
        observations
      );
      expect(annotateLineStub).toHaveBeenCalledWith(2, 'This is a line of code');
    });

    it('should annotate a truncated line of code referenced by the AI', () => {
      // The AI tends to misreport the line number, so we shouldn't rely on it
      annotateLines(
        'Line 1: This is a line of code `if (something) { ... }`',
        observations
      );
      expect(annotateLineStub).toHaveBeenCalledWith(10, 'This is a line of code');
    });

    it('should annotate the first line of code referenced by the AI', () => {
      annotateLines(
        'Line 1: This is a line of code `var x = 5; var y = 6;`',
        observations
      );
      expect(annotateLineStub).toHaveBeenCalledWith(2, 'This is a line of code');
    });

    it('should highlight a single line of code referenced by the AI', () => {
      // The AI tends to misreport the line number, so we shouldn't rely on it
      annotateLines(
        'Line 1: This is a line of code `var x = 5; var y = 6;`',
        observations
      );
      expect(highlightLineStub).toHaveBeenCalledWith(2);
    });

    it('should highlight a truncated line of code referenced by the AI', () => {
      // The AI tends to misreport the line number, so we shouldn't rely on it
      annotateLines(
        'Line 1: This is a line of code `if (something) { ... }`',
        observations
      );
      expect(highlightLineStub).toHaveBeenCalledWith(10);
    });

    it('should highlight all lines of code referenced by the AI', () => {
      annotateLines(
        'Line 1: This is a line of code `var x = 5; var y = 6;`',
        observations
      );
      expect(highlightLineStub).toHaveBeenCalledWith(2);
      expect(highlightLineStub).toHaveBeenCalledWith(3);
    });

    it('should just highlight the lines the AI thinks if the referenced code does not exist', () => {
      annotateLines(
        'Line 45: This is a line of code `var z = 0`',
        observations
      );
      expect(annotateLineStub).toHaveBeenCalledWith(45, 'This is a line of code');
      expect(highlightLineStub).toHaveBeenCalledWith(45);
    });

    it('should just highlight all of the lines the AI thinks if the referenced code does not exist', () => {
      annotateLines(
        'Line 42-44: This is a line of code `var z = 0`',
        observations
      );
      expect(annotateLineStub).toHaveBeenCalledWith(42, 'This is a line of code');
      expect(highlightLineStub).toHaveBeenCalledWith(42);
      expect(highlightLineStub).toHaveBeenCalledWith(43);
      expect(highlightLineStub).toHaveBeenCalledWith(44);
    });

    it('should annotate the last line of code when referenced by the AI', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);
      expect(annotateLineStub).toHaveBeenCalledWith(8, 'This is a line of code');
    });

    it('should pass along the correct info type for the annotation', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);
      expect(annotateLineStub).toHaveBeenCalledWith(expect.anything(), expect.anything(), 'INFO');
    });

    it('should pass along a hex color', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);
      expect(annotateLineStub).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.objectContaining('#')
      );
    });

    it('should pass along the appropriate image as an icon', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);

      expect(annotateLineStub).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.objectContaining('#'),
        infoIconImage
      );
    });

    it('should pass along the appropriate image as an icon for the tooltip', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);

      expect(annotateLineStub).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.objectContaining({backgroundImage: expect.objectContaining(`${tipIconImage}`)})
      );
    });

    it('should highlight the last line of code when referenced by the AI', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);
      expect(highlightLineStub).toHaveBeenCalledWith(8);
    });

    it('should highlight the line with a hex color', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);
      expect(highlightLineStub).toHaveBeenCalledWith(8, expect.objectContaining('#'));
    });

    it('should use the provided line numbers if the code snippet is empty', () => {
      annotateLines('Line 42: This is totally a thing ` `', observations);
      expect(annotateLineStub).toHaveBeenCalledWith(42, 'This is totally a thing');
    });

    it('should use the provided line numbers if the code snippet is missing', () => {
      annotateLines(
        'Line 42: This is totally a thing Lines 45-56: This is also a thing `some code`',
        observations
      );
      expect(annotateLineStub).toHaveBeenCalledWith(42, 'This is totally a thing');
    });

    it('should annotate with the observations if the evidence has no message.', () => {
      annotateLines('Line 42: `draw()`', observations);
      expect(annotateLineStub).toHaveBeenCalledWith(8, observations);
    });

    it('should return the parsed observations when the evidence is blank.', () => {
      const annotations = annotateLines('', observations);

      // One for each sentence
      expect(annotations.length).toBe(2);

      // The lines are undefined for the written annotation since we don't know
      // if it is relevant.
      expect(annotations[0].firstLine).toBeUndefined();

      // And they are in the order provided by the given observations string.
      expect(annotations[0].message).toBe(observations.split('.')[0]);
    });

    it('should return the set of sentences reflected in observations if the evidence has no message.', () => {
      const annotations = annotateLines('Line 42: `draw()`', observations);

      // One for each sentence
      expect(annotations.length).toBe(2);

      // The lines are undefined for the written annotation since we don't know
      // if it is relevant.
      expect(annotations[0].firstLine).toBeUndefined();

      // And they are in the order provided by the given observations string.
      expect(annotations[0].message).toBe(observations.split('.')[0]);
    });
  });

  describe('clearAnnotations', () => {
    beforeEach(() => {
      stubAnnotator();
    });
    afterEach(() => {
      restoreAnnotator();
    });

    it('should clear annotations and clear highlighted lines', () => {
      clearAnnotations();
      sinon.toHaveBeenCalled();
      sinon.toHaveBeenCalled();
    });
  });

  it('changes learning goal when left and right buttons are pressed', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    expect(wrapper.find('Heading5 span').first().text()).toBe(learningGoals[0].learningGoal);
    wrapper.find('button').first().simulate('click');
    expect(wrapper.find('Heading5 span').first().text()).toBe(i18n.rubricLearningGoalSummary());
    wrapper.find('button').at(1).simulate('click');
    expect(wrapper.find('Heading5 span').first().text()).toBe(learningGoals[0].learningGoal);
    wrapper.find('button').at(1).simulate('click');
    expect(wrapper.find('Heading5 span').first().text()).toBe(learningGoals[1].learningGoal);
  });

  it('renders the summary page after AI evaluations are run', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        aiEvaluations={aiEvaluations}
        teacherHasEnabledAi
      />
    );
    wrapper.find('button').first().simulate('click');
    expect(wrapper.find('Heading5 span').first().text()).toBe(i18n.rubricLearningGoalSummary());
  });

  it('renders AiAssessment when teacher has AiEnabled and the learning goal can be tested by AI', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={true}
        aiUnderstanding={3}
        studentLevelInfo={studentLevelInfo}
        aiEvaluations={aiEvaluations}
      />
    );
    expect(wrapper.find('AiAssessment')).toHaveLength(1);
    expect(wrapper.find('AiAssessment').props().studentName).toBe(studentLevelInfo.name);
    expect(wrapper.find('AiAssessment').props().aiConfidence).toBe(2);
    expect(wrapper.find('AiAssessment').props().aiUnderstandingLevel).toBe(2);
    expect(wrapper.find('AiAssessment').props().isAiAssessed).toBe(true);
  });

  it('renders AiAssessment with the annotated list of evidence', () => {
    const aiEvidence = annotateLines(
      aiEvaluations[0].evidence,
      aiEvaluations[0].observations
    );

    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={true}
        aiUnderstanding={3}
        studentLevelInfo={studentLevelInfo}
        aiEvaluations={aiEvaluations}
      />
    );

    expect(wrapper.find('AiAssessment').props().aiEvidence).toEqual(aiEvidence);
  });

  it('does not renders AiAssessment when teacher has disabled ai', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={false}
        studentLevelInfo={studentLevelInfo}
      />
    );
    expect(wrapper.find('AiAssessment')).toHaveLength(0);
  });

  it('renders tips for teachers', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi
        isStudent={false}
      />
    );
    expect(wrapper.find('details')).toHaveLength(1);
    expect(wrapper.find('SafeMarkdown')).toHaveLength(1);
    expect(wrapper.find('SafeMarkdown').props().markdown).toBe('Tips');
  });

  it('does not render tips for students', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} isStudent={true} />
    );
    expect(wrapper.find('details')).toHaveLength(0);
  });

  it('shows AI token when AI is enabled', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    expect(wrapper.find('Heading5 span').first().text()).toBe(learningGoals[0].learningGoal);
    expect(wrapper.find('AiToken')).toHaveLength(1);
  });

  it('does not show AI token when AI is disabled', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    wrapper.find('button').at(1).simulate('click');
    expect(wrapper.find('Heading5 span').first().text()).toBe(learningGoals[1].learningGoal);
    expect(wrapper.find('AiToken')).toHaveLength(0);
  });

  it('does not show AI token when teacher has disabled AI', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={false}
      />
    );
    expect(wrapper.find('Heading5 span').first().text()).toBe(learningGoals[0].learningGoal);
    expect(wrapper.find('AiToken')).toHaveLength(0);
  });

  it('does not show AI token after teacher has submitted evaluation', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: RubricUnderstandingLevels.LIMITED,
        }}
      />
    );
    expect(wrapper.find('AiToken')).toHaveLength(0);
  });

  it('sends event when new learning goal is selected', () => {
    const sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();

    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        reportingData={{unitName: 'test-2023', levelName: 'test-level'}}
        studentLevelInfo={studentLevelInfo}
      />
    );
    wrapper.find('button').at(1).simulate('click');
    expect(sendEventSpy).toHaveBeenCalledWith(EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED, {
      unitName: 'test-2023',
      levelName: 'test-level',
      learningGoalKey: 'efgh',
      learningGoal: 'Learning Goal 2',
      studentId: 1,
    });
    wrapper.find('button').first().simulate('click');
    expect(sendEventSpy).toHaveBeenCalledWith(EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED, {
      unitName: 'test-2023',
      levelName: 'test-level',
      learningGoalKey: 'abcd',
      learningGoal: 'Learning Goal 1',
      studentId: 1,
    });
    sendEventSpy.mockRestore();
  });

  it('shows feedback in disabled textbox when available', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: 1,
        }}
      />
    );
    expect(wrapper.find('textarea').props().value).toBe('test feedback');
    expect(wrapper.find('textarea').props().disabled).toBe(true);
  });

  it('shows editable textbox for feedback when the teacher can provide feedback', async () => {
    const postStub = jest.spyOn(HttpClient, 'post').mockClear().mockReturnValue(
      Promise.resolve({
        json: () => {
          return {
            id: 0,
          };
        },
      })
    );

    const wrapper = mount(
      <LearningGoals
        canProvideFeedback={true}
        studentLevelInfo={studentLevelInfo}
        learningGoals={learningGoals}
      />
    );

    // Need to have it 'load' all the prior evaluations
    await act(async () => {
      await Promise.resolve();
    });

    expect(wrapper.find('textarea').getDOMNode().disabled).toBe(false);
    postStub.mockRestore();
  });

  it('summary shows submitted scores', async () => {
    const postStub = jest.spyOn(HttpClient, 'post').mockClear().mockReturnValue(
      Promise.resolve({
        json: () => {
          return {
            id: 2,
            feedback: 'blah blah',
            understanding: RubricUnderstandingLevels.LIMITED,
          };
        },
      })
    );

    const wrapper = mount(
      <LearningGoals
        canProvideFeedback={true}
        studentLevelInfo={studentLevelInfo}
        learningGoals={learningGoals}
      />
    );

    // Need to have it 'load' all the prior evaluations
    await act(async () => {
      await Promise.resolve();
    });

    wrapper.find('button').first().simulate('click');
    expect(wrapper.find('Heading5 span').first().text()).toBe(i18n.rubricLearningGoalSummary());
    expect(wrapper.find('BodyThreeText StrongText').at(0).text()).toBe('Learning Goal 1');
    expect(wrapper.find('BodyThreeText').at(2).text()).toBe('Limited Evidence');
    postStub.mockRestore();
  });

  it('passes isStudent down to EvidenceLevels', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={submittedEvaluation}
        isStudent
      />
    );
    expect(wrapper.find('EvidenceLevels').props().isStudent).toBe(true);
    expect(wrapper.find('EvidenceLevels').props().submittedEvaluation).toBe(submittedEvaluation);
    expect(wrapper.find('EvidenceLevels').props().evidenceLevels).toBe(learningGoals[0]['evidenceLevels']);
  });

  it('displays progress ring', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={submittedEvaluation}
      />
    );
    expect(wrapper.find('ProgressRing')).toHaveLength(1);
  });
});

import {render, screen, act as rtlAct, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {act} from 'react-dom/test-utils';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import EditorAnnotator from '@cdo/apps/EditorAnnotator';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {
  THUMBS_UP,
  THUMBS_DOWN,
} from '@cdo/apps/templates/rubrics/AiAssessmentFeedbackContext';
import tipIconImage from '@cdo/apps/templates/rubrics/images/AiBot_Icon.svg';
import infoIconImage from '@cdo/apps/templates/rubrics/images/info-icon.svg';
import LearningGoals, {
  clearAnnotations,
  annotateLines,
} from '@cdo/apps/templates/rubrics/LearningGoals';
import HttpClient from '@cdo/apps/util/HttpClient';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {expect as deprecatedExpect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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

async function wait() {
  for (let _ = 0; _ < 10; _++) {
    await rtlAct(async () => Promise.resolve());
  }
}

describe('LearningGoals - React Testing Library', () => {
  let annotatorStub,
    annotateLineStub,
    scrollToLineStub,
    highlightLineStub,
    clearAnnotationsStub,
    clearHighlightedLinesStub;

  // Stub out our references to the singleton and editor
  beforeEach(() => {
    let annotatorInstanceStub = sinon.stub();
    annotatorInstanceStub.getCode = sinon.stub().returns(code);
    annotatorStub = sinon
      .stub(EditorAnnotator, 'annotator')
      .returns(annotatorInstanceStub);
    annotateLineStub = sinon.stub(EditorAnnotator, 'annotateLine');
    scrollToLineStub = sinon.stub(EditorAnnotator, 'scrollToLine');
    clearAnnotationsStub = sinon.stub(EditorAnnotator, 'clearAnnotations');
    highlightLineStub = sinon.stub(EditorAnnotator, 'highlightLine');
    clearHighlightedLinesStub = sinon.stub(
      EditorAnnotator,
      'clearHighlightedLines'
    );
  });
  afterEach(() => {
    annotatorStub.restore();
    scrollToLineStub.restore();
    annotateLineStub.restore();
    clearAnnotationsStub.restore();
    highlightLineStub.restore();
    clearHighlightedLinesStub.restore();
  });

  it('renders EvidenceLevels without canProvideFeedback', () => {
    render(<LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />);

    // This text only shows up within EvidenceLevels when canProvideFeedback is false
    deprecatedExpect(screen.getByText('Rubric Scores')).to.exist;

    // First learning goal is visible
    deprecatedExpect(screen.getByText('Learning Goal 1')).to.exist;
    deprecatedExpect(screen.getByText(/lg one none/)).to.exist;
    deprecatedExpect(screen.getByText(/lg one limited/)).to.exist;
    deprecatedExpect(screen.getByText(/lg one convincing/)).to.exist;
    deprecatedExpect(screen.getByText(/lg one extensive/)).to.exist;
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

    sinon.assert.calledWith(scrollToLineStub, 3);

    const button = screen.getByRole('button', {
      name: i18n.rubricNextLearningGoal(),
    });
    await user.click(button);

    sinon.assert.calledWith(scrollToLineStub, 7);
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

    sinon.assert.notCalled(scrollToLineStub);
  });

  it('does not fail to render when the evidence is null', async () => {
    const myAiEvaluations = [
      {
        ...aiEvaluations[0],
        evidence: null,
      },
      {
        ...aiEvaluations[1],
        evidence: null,
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
      deprecatedExpect(getSuggestedButtonNames()).to.deep.equal(['Convincing']);
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
      deprecatedExpect(getSuggestedButtonNames().sort()).to.deep.equal(
        ['Convincing', 'Extensive'].sort()
      );
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
    const sendEventSpy = sinon.spy(analyticsReporter, 'sendEvent');

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
    deprecatedExpect(hoverCallback).to.not.be.undefined;

    // Call the callback ourselves
    hoverCallback({});

    // We should have triggered the sending of the event with the given data.
    const eventName = EVENTS.TA_RUBRIC_EVIDENCE_TOOLTIP_HOVERED;
    deprecatedExpect(sendEventSpy).to.have.been.calledWith(eventName, {
      ...reportingData,
      learningGoalKey: learningGoals[0].key,
      learningGoal: learningGoals[0].learningGoal,
      studentId: studentLevelInfo.user_id,
    });

    // Restore stubs
    sendEventSpy.restore();
  });

  describe('ai evaluation feedback', () => {
    const feedbackProps = {
      teacherHasEnabledAi: true,
      learningGoals,
      aiEvaluations,
      studentLevelInfo,
      canProvideFeedback: true,
    };

    it('sends an event when thumbs up is clicked', async () => {
      render(<LearningGoals {...feedbackProps} />);

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
        learningGoalAiEvaluationId: 2,
        aiFeedbackApproval: THUMBS_UP,
      });
      expect(fetchStub).toHaveBeenCalledWith(
        '/learning_goal_ai_evaluation_feedbacks',
        {
          body: expectedBody,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': 'token',
          },
          method: 'POST',
        }
      );

      fetchStub.mockRestore();
    });

    it('sends an event when thumbs down is clicked', async () => {
      render(<LearningGoals {...feedbackProps} />);

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
        learningGoalAiEvaluationId: 2,
        aiFeedbackApproval: THUMBS_DOWN,
      });
      expect(fetchStub).toHaveBeenCalledWith(
        '/learning_goal_ai_evaluation_feedbacks',
        {
          body: expectedBody,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': 'token',
          },
          method: 'POST',
        }
      );

      fetchStub.mockRestore();
    });

    it('updates the thumbs down event when survey is submitted', async () => {
      render(<LearningGoals {...feedbackProps} />);

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

      const thumbsUpButton = screen.getByTestId('thumbs-o-down');
      fireEvent.click(thumbsUpButton);
      await wait();

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
        learningGoalAiEvaluationId: 2,
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
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': 'token',
          },
          method: 'PUT',
        }
      );

      fetchStub.mockRestore();
    });
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
    let annotatorInstanceStub = sinon.stub();
    annotatorInstanceStub.getCode = sinon.stub().returns(code);
    annotatorStub = sinon
      .stub(EditorAnnotator, 'annotator')
      .returns(annotatorInstanceStub);
    annotateLineStub = sinon.stub(EditorAnnotator, 'annotateLine');
    scrollToLineStub = sinon.stub(EditorAnnotator, 'scrollToLine');
    clearAnnotationsStub = sinon.stub(EditorAnnotator, 'clearAnnotations');
    highlightLineStub = sinon.stub(EditorAnnotator, 'highlightLine');
    clearHighlightedLinesStub = sinon.stub(
      EditorAnnotator,
      'clearHighlightedLines'
    );
  }

  function restoreAnnotator() {
    annotatorStub.restore();
    scrollToLineStub.restore();
    annotateLineStub.restore();
    clearAnnotationsStub.restore();
    highlightLineStub.restore();
    clearHighlightedLinesStub.restore();
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
      deprecatedExpect(annotateLineStub.notCalled).to.be.true;
    });

    it('should annotate a single line of code referenced by the AI', () => {
      // The AI tends to misreport the line number, so we shouldn't rely on it
      annotateLines(
        'Line 1: This is a line of code `var x = 5;`',
        observations
      );
      sinon.assert.calledWith(annotateLineStub, 2, 'This is a line of code');
    });

    it('should annotate a truncated line of code referenced by the AI', () => {
      // The AI tends to misreport the line number, so we shouldn't rely on it
      annotateLines(
        'Line 1: This is a line of code `if (something) { ... }`',
        observations
      );
      sinon.assert.calledWith(annotateLineStub, 10, 'This is a line of code');
    });

    it('should annotate the first line of code referenced by the AI', () => {
      annotateLines(
        'Line 1: This is a line of code `var x = 5; var y = 6;`',
        observations
      );
      sinon.assert.calledWith(annotateLineStub, 2, 'This is a line of code');
    });

    it('should highlight a single line of code referenced by the AI', () => {
      // The AI tends to misreport the line number, so we shouldn't rely on it
      annotateLines(
        'Line 1: This is a line of code `var x = 5; var y = 6;`',
        observations
      );
      sinon.assert.calledWith(highlightLineStub, 2);
    });

    it('should highlight a truncated line of code referenced by the AI', () => {
      // The AI tends to misreport the line number, so we shouldn't rely on it
      annotateLines(
        'Line 1: This is a line of code `if (something) { ... }`',
        observations
      );
      sinon.assert.calledWith(highlightLineStub, 10);
    });

    it('should highlight all lines of code referenced by the AI', () => {
      annotateLines(
        'Line 1: This is a line of code `var x = 5; var y = 6;`',
        observations
      );
      sinon.assert.calledWith(highlightLineStub, 2);
      sinon.assert.calledWith(highlightLineStub, 3);
    });

    it('should just highlight the lines the AI thinks if the referenced code does not exist', () => {
      annotateLines(
        'Line 45: This is a line of code `var z = 0`',
        observations
      );
      sinon.assert.calledWith(annotateLineStub, 45, 'This is a line of code');
      sinon.assert.calledWith(highlightLineStub, 45);
    });

    it('should just highlight all of the lines the AI thinks if the referenced code does not exist', () => {
      annotateLines(
        'Line 42-44: This is a line of code `var z = 0`',
        observations
      );
      sinon.assert.calledWith(annotateLineStub, 42, 'This is a line of code');
      sinon.assert.calledWith(highlightLineStub, 42);
      sinon.assert.calledWith(highlightLineStub, 43);
      sinon.assert.calledWith(highlightLineStub, 44);
    });

    it('should annotate the last line of code when referenced by the AI', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);
      sinon.assert.calledWith(annotateLineStub, 8, 'This is a line of code');
    });

    it('should pass along the correct info type for the annotation', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);
      sinon.assert.calledWith(
        annotateLineStub,
        sinon.match.any,
        sinon.match.any,
        'INFO'
      );
    });

    it('should pass along a hex color', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);
      sinon.assert.calledWith(
        annotateLineStub,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match('#')
      );
    });

    it('should pass along the appropriate image as an icon', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);

      sinon.assert.calledWith(
        annotateLineStub,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match('#'),
        infoIconImage
      );
    });

    it('should pass along the appropriate image as an icon for the tooltip', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);

      sinon.assert.calledWith(
        annotateLineStub,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match({backgroundImage: sinon.match(`${tipIconImage}`)})
      );
    });

    it('should highlight the last line of code when referenced by the AI', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);
      sinon.assert.calledWith(highlightLineStub, 8);
    });

    it('should highlight the line with a hex color', () => {
      annotateLines('Line 55: This is a line of code `draw();`', observations);
      sinon.assert.calledWith(highlightLineStub, 8, sinon.match('#'));
    });

    it('should use the provided line numbers if the code snippet is empty', () => {
      annotateLines('Line 42: This is totally a thing ` `', observations);
      sinon.assert.calledWith(annotateLineStub, 42, 'This is totally a thing');
    });

    it('should use the provided line numbers if the code snippet is missing', () => {
      annotateLines(
        'Line 42: This is totally a thing Lines 45-56: This is also a thing `some code`',
        observations
      );
      sinon.assert.calledWith(annotateLineStub, 42, 'This is totally a thing');
    });

    it('should annotate with the observations if the evidence has no message.', () => {
      annotateLines('Line 42: `draw()`', observations);
      sinon.assert.calledWith(annotateLineStub, 8, observations);
    });

    it('should return the parsed observations when the evidence is blank.', () => {
      const annotations = annotateLines('', observations);

      // One for each sentence
      deprecatedExpect(annotations.length).to.be.equal(2);

      // The lines are undefined for the written annotation since we don't know
      // if it is relevant.
      deprecatedExpect(annotations[0].firstLine).to.be.undefined;

      // And they are in the order provided by the given observations string.
      deprecatedExpect(annotations[0].message).to.be.equal(
        observations.split('.')[0]
      );
    });

    it('should return the set of sentences reflected in observations if the evidence has no message.', () => {
      const annotations = annotateLines('Line 42: `draw()`', observations);

      // One for each sentence
      deprecatedExpect(annotations.length).to.be.equal(2);

      // The lines are undefined for the written annotation since we don't know
      // if it is relevant.
      deprecatedExpect(annotations[0].firstLine).to.be.undefined;

      // And they are in the order provided by the given observations string.
      deprecatedExpect(annotations[0].message).to.be.equal(
        observations.split('.')[0]
      );
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
      sinon.assert.called(clearAnnotationsStub);
      sinon.assert.called(clearHighlightedLinesStub);
    });
  });

  it('changes learning goal when left and right buttons are pressed', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    deprecatedExpect(wrapper.find('Heading5 span').first().text()).to.equal(
      learningGoals[0].learningGoal
    );
    wrapper.find('button').first().simulate('click');
    deprecatedExpect(wrapper.find('Heading5 span').first().text()).to.equal(
      i18n.rubricLearningGoalSummary()
    );
    wrapper.find('button').at(1).simulate('click');
    deprecatedExpect(wrapper.find('Heading5 span').first().text()).to.equal(
      learningGoals[0].learningGoal
    );
    wrapper.find('button').at(1).simulate('click');
    deprecatedExpect(wrapper.find('Heading5 span').first().text()).to.equal(
      learningGoals[1].learningGoal
    );
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
    deprecatedExpect(wrapper.find('Heading5 span').first().text()).to.equal(
      i18n.rubricLearningGoalSummary()
    );
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
    deprecatedExpect(wrapper.find('AiAssessment')).to.have.lengthOf(1);
    deprecatedExpect(wrapper.find('AiAssessment').props().studentName).to.equal(
      studentLevelInfo.name
    );
    deprecatedExpect(
      wrapper.find('AiAssessment').props().aiConfidence
    ).to.equal(2);
    deprecatedExpect(
      wrapper.find('AiAssessment').props().aiUnderstandingLevel
    ).to.equal(2);
    deprecatedExpect(
      wrapper.find('AiAssessment').props().isAiAssessed
    ).to.equal(true);
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

    deprecatedExpect(
      wrapper.find('AiAssessment').props().aiEvidence
    ).to.deep.equal(aiEvidence);
  });

  it('does not renders AiAssessment when teacher has disabled ai', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={false}
        studentLevelInfo={studentLevelInfo}
      />
    );
    deprecatedExpect(wrapper.find('AiAssessment')).to.have.lengthOf(0);
  });

  it('renders tips for teachers', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi
        isStudent={false}
      />
    );
    deprecatedExpect(wrapper.find('details')).to.have.lengthOf(1);
    deprecatedExpect(wrapper.find('SafeMarkdown')).to.have.lengthOf(1);
    deprecatedExpect(wrapper.find('SafeMarkdown').props().markdown).to.equal(
      'Tips'
    );
  });

  it('does not render tips for students', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} isStudent={true} />
    );
    deprecatedExpect(wrapper.find('details')).to.have.lengthOf(0);
  });

  it('shows AI token when AI is enabled', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    deprecatedExpect(wrapper.find('Heading5 span').first().text()).to.equal(
      learningGoals[0].learningGoal
    );
    deprecatedExpect(wrapper.find('AiToken')).to.have.lengthOf(1);
  });

  it('does not show AI token when AI is disabled', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    wrapper.find('button').at(1).simulate('click');
    deprecatedExpect(wrapper.find('Heading5 span').first().text()).to.equal(
      learningGoals[1].learningGoal
    );
    deprecatedExpect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('does not show AI token when teacher has disabled AI', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={false}
      />
    );
    deprecatedExpect(wrapper.find('Heading5 span').first().text()).to.equal(
      learningGoals[0].learningGoal
    );
    deprecatedExpect(wrapper.find('AiToken')).to.have.lengthOf(0);
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
    deprecatedExpect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('sends event when new learning goal is selected', () => {
    const sendEventSpy = sinon.spy(analyticsReporter, 'sendEvent');

    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        reportingData={{unitName: 'test-2023', levelName: 'test-level'}}
        studentLevelInfo={studentLevelInfo}
      />
    );
    wrapper.find('button').at(1).simulate('click');
    deprecatedExpect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'efgh',
        learningGoal: 'Learning Goal 2',
        studentId: 1,
      }
    );
    wrapper.find('button').first().simulate('click');
    deprecatedExpect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'abcd',
        learningGoal: 'Learning Goal 1',
        studentId: 1,
      }
    );
    sendEventSpy.restore();
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
    deprecatedExpect(wrapper.find('textarea').props().value).to.equal(
      'test feedback'
    );
    deprecatedExpect(wrapper.find('textarea').props().disabled).to.equal(true);
  });

  it('shows editable textbox for feedback when the teacher can provide feedback', async () => {
    const postStub = sinon.stub(HttpClient, 'post').returns(
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

    deprecatedExpect(wrapper.find('textarea').getDOMNode().disabled).to.equal(
      false
    );
    postStub.restore();
  });

  it('summary shows submitted scores', async () => {
    const postStub = sinon.stub(HttpClient, 'post').returns(
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
    deprecatedExpect(wrapper.find('Heading5 span').first().text()).to.equal(
      i18n.rubricLearningGoalSummary()
    );
    deprecatedExpect(
      wrapper.find('BodyThreeText StrongText').at(0).text()
    ).to.equal('Learning Goal 1');
    deprecatedExpect(wrapper.find('BodyThreeText').at(2).text()).to.equal(
      'Limited Evidence'
    );
    postStub.restore();
  });

  it('passes isStudent down to EvidenceLevels', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={submittedEvaluation}
        isStudent
      />
    );
    deprecatedExpect(wrapper.find('EvidenceLevels').props().isStudent).to.equal(
      true
    );
    deprecatedExpect(
      wrapper.find('EvidenceLevels').props().submittedEvaluation
    ).to.equal(submittedEvaluation);
    deprecatedExpect(
      wrapper.find('EvidenceLevels').props().evidenceLevels
    ).to.equal(learningGoals[0]['evidenceLevels']);
  });

  it('displays progress ring', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={submittedEvaluation}
      />
    );
    deprecatedExpect(wrapper.find('ProgressRing')).to.have.lengthOf(1);
  });
});

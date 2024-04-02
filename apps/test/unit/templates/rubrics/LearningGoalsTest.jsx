import {render, screen} from '@testing-library/react';
import {shallow, mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import sinon from 'sinon';

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
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai';

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

describe('LearningGoals - React Testing Library', () => {
  let annotatorStub,
    annotateLineStub,
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
    clearAnnotationsStub = sinon.stub(EditorAnnotator, 'clearAnnotations');
    highlightLineStub = sinon.stub(EditorAnnotator, 'highlightLine');
    clearHighlightedLinesStub = sinon.stub(
      EditorAnnotator,
      'clearHighlightedLines'
    );
  });
  afterEach(() => {
    annotatorStub.restore();
    annotateLineStub.restore();
    clearAnnotationsStub.restore();
    highlightLineStub.restore();
    clearHighlightedLinesStub.restore();
  });

  it('renders EvidenceLevels without canProvideFeedback', () => {
    render(<LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />);

    // This text only shows up within EvidenceLevels when canProvideFeedback is false
    expect(screen.getByText('Rubric Scores')).to.exist;

    // First learning goal is visible
    expect(screen.getByText('Learning Goal 1')).to.exist;
    expect(screen.getByText(/lg one none/)).to.exist;
    expect(screen.getByText(/lg one limited/)).to.exist;
    expect(screen.getByText(/lg one convincing/)).to.exist;
    expect(screen.getByText(/lg one extensive/)).to.exist;
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
      expect(getSuggestedButtonNames()).to.deep.equal(['Convincing']);
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
      expect(getSuggestedButtonNames().sort()).to.deep.equal(
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
    highlightLineStub,
    clearAnnotationsStub,
    clearHighlightedLinesStub;
  const studentLevelInfo = {name: 'Grace Hopper', timeSpent: 706};

  function stubAnnotator() {
    // Stub out our references to the singleton and editor
    let annotatorInstanceStub = sinon.stub();
    annotatorInstanceStub.getCode = sinon.stub().returns(code);
    annotatorStub = sinon
      .stub(EditorAnnotator, 'annotator')
      .returns(annotatorInstanceStub);
    annotateLineStub = sinon.stub(EditorAnnotator, 'annotateLine');
    clearAnnotationsStub = sinon.stub(EditorAnnotator, 'clearAnnotations');
    highlightLineStub = sinon.stub(EditorAnnotator, 'highlightLine');
    clearHighlightedLinesStub = sinon.stub(
      EditorAnnotator,
      'clearHighlightedLines'
    );
  }

  function restoreAnnotator() {
    annotatorStub.restore();
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
      expect(annotateLineStub.notCalled).to.be.true;
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
        sinon.match({backgroundImage: sinon.match(tipIconImage)})
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
    expect(wrapper.find('Heading5 span').first().text()).to.equal(
      learningGoals[0].learningGoal
    );
    wrapper.find('button').first().simulate('click');
    expect(wrapper.find('Heading5 span').first().text()).to.equal(
      i18n.rubricLearningGoalSummary()
    );
    wrapper.find('button').at(1).simulate('click');
    expect(wrapper.find('Heading5 span').first().text()).to.equal(
      learningGoals[0].learningGoal
    );
    wrapper.find('button').at(1).simulate('click');
    expect(wrapper.find('Heading5 span').first().text()).to.equal(
      learningGoals[1].learningGoal
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
    expect(wrapper.find('AiAssessment')).to.have.lengthOf(1);
    expect(wrapper.find('AiAssessment').props().studentName).to.equal(
      studentLevelInfo.name
    );
    expect(wrapper.find('AiAssessment').props().aiConfidence).to.equal(2);
    expect(wrapper.find('AiAssessment').props().aiUnderstandingLevel).to.equal(
      2
    );
    expect(wrapper.find('AiAssessment').props().isAiAssessed).to.equal(true);
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

    expect(wrapper.find('AiAssessment').props().aiEvidence).to.deep.equal(
      aiEvidence
    );
  });

  it('does not renders AiAssessment when teacher has disabled ai', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={false}
        studentLevelInfo={studentLevelInfo}
      />
    );
    expect(wrapper.find('AiAssessment')).to.have.lengthOf(0);
  });

  it('renders tips for teachers', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi
        isStudent={false}
      />
    );
    expect(wrapper.find('details')).to.have.lengthOf(1);
    expect(wrapper.find('SafeMarkdown')).to.have.lengthOf(1);
    expect(wrapper.find('SafeMarkdown').props().markdown).to.equal('Tips');
  });

  it('does not render tips for students', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} isStudent={true} />
    );
    expect(wrapper.find('details')).to.have.lengthOf(0);
  });

  it('shows AI token when AI is enabled', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    expect(wrapper.find('Heading5 span').first().text()).to.equal(
      learningGoals[0].learningGoal
    );
    expect(wrapper.find('AiToken')).to.have.lengthOf(1);
  });

  it('does not show AI token when AI is disabled', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    wrapper.find('button').at(1).simulate('click');
    expect(wrapper.find('Heading5 span').first().text()).to.equal(
      learningGoals[1].learningGoal
    );
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('does not show AI token when teacher has disabled AI', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={false}
      />
    );
    expect(wrapper.find('Heading5 span').first().text()).to.equal(
      learningGoals[0].learningGoal
    );
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
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
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('sends event when new learning goal is selected', () => {
    const sendEventSpy = sinon.spy(analyticsReporter, 'sendEvent');

    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        reportingData={{unitName: 'test-2023', levelName: 'test-level'}}
      />
    );
    wrapper.find('button').at(1).simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'efgh',
        learningGoal: 'Learning Goal 2',
      }
    );
    wrapper.find('button').first().simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'abcd',
        learningGoal: 'Learning Goal 1',
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
    expect(wrapper.find('textarea').props().value).to.equal('test feedback');
    expect(wrapper.find('textarea').props().disabled).to.equal(true);
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

    expect(wrapper.find('textarea').getDOMNode().disabled).to.equal(false);
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
    expect(wrapper.find('Heading5 span').first().text()).to.equal(
      i18n.rubricLearningGoalSummary()
    );
    expect(wrapper.find('BodyThreeText StrongText').at(0).text()).to.equal(
      'Learning Goal 1'
    );
    expect(wrapper.find('BodyThreeText').at(2).text()).to.equal(
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
    expect(wrapper.find('EvidenceLevels').props().isStudent).to.equal(true);
    expect(wrapper.find('EvidenceLevels').props().submittedEvaluation).to.equal(
      submittedEvaluation
    );
    expect(wrapper.find('EvidenceLevels').props().evidenceLevels).to.equal(
      learningGoals[0]['evidenceLevels']
    );
  });

  it('displays progress ring', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={submittedEvaluation}
      />
    );
    expect(wrapper.find('ProgressRing')).to.have.lengthOf(1);
  });
});

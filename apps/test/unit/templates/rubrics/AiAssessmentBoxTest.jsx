import {mount} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditorAnnotator from '@cdo/apps/EditorAnnotator';
import AiAssessmentBox from '@cdo/apps/templates/rubrics/AiAssessmentBox';
import AiAssessmentFeedbackContext from '@cdo/apps/templates/rubrics/AiAssessmentFeedbackContext';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai';

describe('AiAssessmentBox', () => {
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
  const props = {
    isAiAssessed: true,
    studentName: 'Jane Doe',
    aiUnderstandingLevel: RubricUnderstandingLevels.CONVINCING,
    aiConfidence: 70,
    aiEvalInfo: mockAiInfo,
    aiEvidence: mockEvidence,
  };

  it('renders AiAssessmentBox with student information if it is assessed by AI', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider value={[-1, () => {}]}>
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(
      wrapper.find('BodyFourText StrongText + span').first().text()
    ).to.equal(
      i18n.aiStudentAssessment({
        studentName: props.studentName,
        understandingLevel: i18n.aiAssessmentDoesMeet(),
      })
    );
  });

  it('renders AiAssessmentBox with AiConfidenceBox when available', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider value={[-1, () => {}]}>
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('AiConfidenceBox')).to.have.lengthOf(1);
  });

  it('renders AiAssessmentBox without AiConfidenceBox when unavailable', () => {
    const updatedProps = {
      ...props,
      aiConfidence: null,
    };
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider value={[-1, () => {}]}>
        <AiAssessmentBox {...updatedProps} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('AiConfidenceBox')).to.have.lengthOf(0);
  });

  it('should render associated message for aiAssessed with convincing understanding', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider value={[-1, () => {}]}>
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
    ).to.be.true;
  });

  it('should render associated message for aiAssessed with limited understanding', () => {
    const updatedProps = {
      ...props,
      aiUnderstandingLevel: RubricUnderstandingLevels.LIMITED,
    };
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider value={[-1, () => {}]}>
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
    ).to.be.true;
  });

  it('renders AiAssessmentBox with notice that AI cannot be used when the topic is too subjective to be evaluated', () => {
    const updatedProps = {...props, isAiAssessed: false};
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider value={[-1, () => {}]}>
        <AiAssessmentBox {...updatedProps} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('BodyThreeText')).to.have.lengthOf(0);
    expect(wrapper.find('EmText')).to.have.lengthOf(1);
    expect(wrapper.html().includes(i18n.aiCannotAssess())).to.be.true;
  });

  it('renders no evidence if none is given', () => {
    const updatedProps = {...props, aiEvidence: []};
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider value={[-1, () => {}]}>
        <AiAssessmentBox {...updatedProps} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('ul li')).to.have.lengthOf(0);
    expect(wrapper.html().includes(props.aiEvidence[0].message)).to.be.false;
  });

  it('renders evidence when given', () => {
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider value={[-1, () => {}]}>
        <AiAssessmentBox {...props} />
      </AiAssessmentFeedbackContext.Provider>
    );
    expect(wrapper.find('ul li')).to.have.lengthOf(2);
    expect(wrapper.html().includes(props.aiEvidence[0].message)).to.be.true;

    // Expect that lines are present
    expect(wrapper.html().includes(`Lines`)).to.be.true;

    // And we expect two links for each line for a total of 4 links
    expect(wrapper.find('ul li p a')).to.have.lengthOf(4);
  });

  it('falls back to rendering evidence as observations if there is no line numbers', () => {
    const updatedProps = {...props, aiEvidence: mockEvidenceWithoutLines};
    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider value={[-1, () => {}]}>
        <AiAssessmentBox {...updatedProps} />
      </AiAssessmentFeedbackContext.Provider>
    );
    // Still one list item per evidence provided.
    expect(wrapper.find('ul li')).to.have.lengthOf(3);
    // We expect no links
    expect(wrapper.find('ul li p a')).to.have.lengthOf(0);
    // And it should not render line numbers in this case since it does not know
    // where any particular observation actually is.
    expect(wrapper.html().includes(`Lines`)).to.be.false;
  });

  it('navigates to the line when the evidence link for a line number is activated', () => {
    const scrollToLineStub = sinon.stub(EditorAnnotator, 'scrollToLine');

    const wrapper = mount(
      <AiAssessmentFeedbackContext.Provider value={[-1, () => {}]}>
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
    sinon.assert.calledWith(scrollToLineStub, lineNumber);

    // Restore stubs
    scrollToLineStub.restore();
  });
});

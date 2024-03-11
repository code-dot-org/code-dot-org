import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import AiAssessmentFeedbackContext from '@cdo/apps/templates/rubrics/AiAssessmentFeedbackContext';
import AiAssessmentBox from '@cdo/apps/templates/rubrics/AiAssessmentBox';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

describe('AiAssessmentBox', () => {
  const mockAiInfo = {
    id: 2,
    learning_goal_id: 2,
    understanding: 2,
    ai_confidence: 2,
  };
  const mockEvidence = [
    {
      firstLine: 1,
      lastLine: 10,
      message: 'This is evidence.',
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
    expect(wrapper.find('ul li')).to.have.lengthOf(1);
    expect(wrapper.html().includes(props.aiEvidence[0].message)).to.be.true;
    expect(
      wrapper
        .html()
        .includes(
          `Lines ${props.aiEvidence[0].firstLine}-${props.aiEvidence[0].lastLine}`
        )
    ).to.be.true;
  });
});

import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import AiAssessmentBox from '@cdo/apps/templates/rubrics/AiAssessmentBox';
import style from '@cdo/apps/templates/rubrics/rubrics.module.scss';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

describe('AiAssessmentBox', () => {
  const props = {
    isAiAssessed: true,
    studentName: 'Jane Doe',
    aiUnderstandingLevel: RubricUnderstandingLevels.CONVINCING,
    aiConfidence: 70,
  };

  it('renders AiAssessmentBox with student information if it is assessessed by AI', () => {
    const wrapper = shallow(<AiAssessmentBox {...props} />);
    expect(wrapper.find('EmText')).to.have.lengthOf(1);
    expect(wrapper.find('BodyThreeText')).to.have.lengthOf(1);
    expect(wrapper.find('ReactTooltip')).to.have.lengthOf(1);
  });

  it('renders AiAssessmentBox without AI confidence when unavailable', () => {
    const updatedProps = {
      ...props,
      aiConfidence: null,
    };
    const wrapper = shallow(<AiAssessmentBox {...updatedProps} />);
    expect(wrapper.find('EmText')).to.have.lengthOf(0);
    expect(wrapper.find('BodyThreeText')).to.have.lengthOf(1);
    expect(wrapper.find('ReactTooltip')).to.have.lengthOf(0);
  });

  it('should have green color and associated message for aiAssessed with convincing understanding', () => {
    const wrapper = shallow(<AiAssessmentBox {...props} />);
    expect(wrapper.find('div').first().hasClass(style.greenAiAssessment)).to.be
      .true;
    expect(
      wrapper.html().includes(
        i18n.aiStudentAssessment({
          studentName: props.studentName,
          understandingLevel: i18n.aiAssessmentDoesMeet(),
        })
      )
    ).to.be.true;
  });

  it('should have red color and associated message for aiAssessed with limited understanding', () => {
    const updatedProps = {
      ...props,
      aiUnderstandingLevel: RubricUnderstandingLevels.LIMITED,
    };
    const wrapper = shallow(<AiAssessmentBox {...updatedProps} />);
    expect(wrapper.find('div').first().hasClass(style.redAiAssessment)).to.be
      .true;

    expect(
      wrapper.html().includes(
        i18n.aiStudentAssessment({
          studentName: props.studentName,
          understandingLevel: i18n.aiAssessmentDoesNotMeet(),
        })
      )
    ).to.be.true;
  });

  it('renders AiAssessmentBox with notice that AI Cannot be used to assess this box when the topic is to subjective to be evaluated', () => {
    const updatedProps = {...props, isAiAssessed: false};
    const wrapper = shallow(<AiAssessmentBox {...updatedProps} />);
    expect(wrapper.find('BodyThreeText')).to.have.lengthOf(0);
    expect(wrapper.find('EmText')).to.have.lengthOf(1);
    expect(wrapper.html().includes(i18n.aiCannotAssess())).to.be.true;
    expect(wrapper.find('div').first().hasClass(style.noAiAssessment)).to.be
      .true;
  });
});

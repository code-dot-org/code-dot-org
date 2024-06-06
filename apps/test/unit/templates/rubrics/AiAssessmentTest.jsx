import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AiAssessment from '@cdo/apps/templates/rubrics/AiAssessment';

import {expect} from '../../../util/reconfiguredChai';

describe('AiAssessment', () => {
  const mockAiInfo = {
    id: 2,
    learning_goal_id: 2,
    understanding: 2,
    aiConfidencePassFail: 2,
  };
  const props = {
    isAiAssessed: true,
    studentName: 'Jane Doe',
    aiUnderstandingLevel: 3,
    aiConfidence: 70,
    learningGoalKey: 'learning_goal',
    aiEvalInfo: mockAiInfo,
  };

  it('renders AiAssessmentBox and passes down properties', () => {
    const wrapper = shallow(<AiAssessment {...props} />);
    expect(wrapper.find('AiAssessmentBox')).to.have.lengthOf(1);
    expect(wrapper.find('AiAssessmentBox').props().isAiAssessed).to.equal(
      props.isAiAssessed
    );
    expect(wrapper.find('AiAssessmentBox').props().studentName).to.equal(
      props.studentName
    );
    expect(
      wrapper.find('AiAssessmentBox').props().aiUnderstandingLevel
    ).to.equal(props.aiUnderstandingLevel);
    expect(wrapper.find('AiAssessmentBox').props().aiConfidence).to.equal(
      props.aiConfidence
    );
  });
});

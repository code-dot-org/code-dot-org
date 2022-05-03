import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedCommitsAndReviewTab as CommitsAndReviewTab} from '@cdo/apps/templates/instructions/CommitsAndReviewTab';
import javalabMsg from '@cdo/javalab/locale';
import ReviewNavigator from '@cdo/apps/templates/instructions/codeReviewV2/ReviewNavigator';
import Button from '@cdo/apps/templates/Button';

const DEFAULT_PROPS = {
  onLoadComplete: () => {},
  channelId: 'asdfjkl',
  serverLevelId: 1,
  serverScriptId: 2,
  viewAsCodeReviewer: true,
  viewAsTeacher: false,
  codeReviewEnabled: true
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<CommitsAndReviewTab {...props} />);
};

describe('CommitsAndReviewTab', () => {
  it('displays no code review until student edits code message if there is no channelId', () => {
    const wrapper = setUp({channelId: null});
    expect(wrapper.contains(javalabMsg.noCodeReviewUntilStudentEditsCode()));
  });

  it('displays ReviewNavigator if codeReviewEnabled and not viewing as teacher', () => {
    const wrapper = setUp({codeReviewEnabled: true, viewAsTeacher: false});
    expect(wrapper.find(ReviewNavigator)).to.have.length(1);
  });

  it('does not display ReviewNavigator if codeReviewEnabled is false', () => {
    const wrapper = setUp({codeReviewEnabled: false, viewAsTeacher: false});
    expect(wrapper.find(ReviewNavigator)).to.have.length(0);
  });

  it('does not display ReviewNavigator if viewAsTeacher is true', () => {
    const wrapper = setUp({codeReviewEnabled: true, viewAsTeacher: true});
    expect(wrapper.find(ReviewNavigator)).to.have.length(0);
  });

  it('displays refresh button', () => {
    const wrapper = setUp();
    const refreshButton = wrapper.find(Button);
    expect(refreshButton).to.have.length(1);
    expect(refreshButton.props().icon).to.equal('refresh');
  });
});

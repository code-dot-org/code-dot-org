import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedCommitsAndReviewTab as CommitsAndReviewTab} from '@cdo/apps/templates/instructions/CommitsAndReviewTab';
import javalabMsg from '@cdo/javalab/locale';
import ReviewNavigator from '@cdo/apps/templates/instructions/codeReviewV2/ReviewNavigator';
import CodeReviewTimeline from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimeline';
import Button from '@cdo/apps/templates/Button';

const DEFAULT_PROPS = {
  channelId: 'asdfjkl',
  serverLevelId: 1,
  serverScriptId: 2,
  viewAsCodeReviewer: true,
  viewAsTeacher: false,
  userIsTeacher: false,
  codeReviewEnabled: true,
  locale: 'en_us',
  isReadOnlyWorkspace: false,
  setIsReadOnlyWorkspace: () => {}
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
    const refreshButton = wrapper.find(Button).first();
    expect(refreshButton.props().icon).to.equal('refresh');
  });

  it('displays a CodeReviewTimeline', () => {
    const wrapper = setUp();
    expect(wrapper.find(CodeReviewTimeline)).to.have.length(1);
  });

  it('displays the open review button if there is no open review data loaded and it is not readonly workspace', () => {
    const wrapper = setUp();
    const openReviewButton = wrapper.find(Button).at(1);
    expect(openReviewButton).to.have.length(1);
    expect(openReviewButton.props().text).to.equal(javalabMsg.startReview());
  });

  it('hides the open review button if it is a readonly workspace', () => {
    const wrapper = setUp({isReadOnlyWorkspace: true});
    const openReviewButton = wrapper.find(Button).at(1);
    expect(openReviewButton).to.have.length(0);
  });

  it('disables the open review button when prop codeReviewEnabled is false', () => {
    const wrapper = setUp({codeReviewEnabled: false});
    const openReviewButton = wrapper.find(Button).at(1);
    expect(openReviewButton.props().disabled).to.be.true;
  });

  it('displays code review disabled message when prop codeReviewEnabled is false', () => {
    const wrapper = setUp({codeReviewEnabled: false});
    expect(wrapper.contains(javalabMsg.codeReviewDisabledMessage())).to.be.true;
  });
});

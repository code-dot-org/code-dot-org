import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import CodeReviewCommentEditor from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewCommentEditor';
import Button from '@cdo/apps/templates/Button';
import javalabMsg from '@cdo/javalab/locale';

const DEFAULT_PROPS = {
  addCodeReviewComment: () => {}
};

const setUp = (overrideProps = {}, useMount = false) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return useMount
    ? mount(<CodeReviewCommentEditor {...props} />)
    : shallow(<CodeReviewCommentEditor {...props} />);
};

describe('CodeReviewCommentEditor', () => {
  it('enables submit button when textarea contains text', () => {
    const wrapper = setUp();
    let submitButton = wrapper.find(Button);
    expect(submitButton.props().disabled).to.be.true;

    wrapper.find('textarea').simulate('change', {target: {value: 'a comment'}});
    submitButton = wrapper.find(Button);
    expect(submitButton.props().disabled).to.be.false;
  });

  it('renders a submit button which calls addCodeReviewComment', () => {
    const addCommentSpy = sinon.spy();
    const wrapper = setUp({addCodeReviewComment: addCommentSpy}, true);
    wrapper.find('textarea').simulate('change', {target: {value: 'a comment'}});

    const submitButton = wrapper.find(Button);
    expect(submitButton.props().text).to.equal(javalabMsg.submit());

    submitButton.simulate('click');
    expect(addCommentSpy).to.have.been.called;
  });
});

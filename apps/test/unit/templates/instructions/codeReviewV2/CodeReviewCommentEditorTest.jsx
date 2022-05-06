import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import CodeReviewCommentEditor from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewCommentEditor';
import {Editor} from '@toast-ui/react-editor';
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
  it('renders a toast ui editor', () => {
    const wrapper = setUp();
    expect(wrapper.find(Editor)).to.have.length(1);
  });

  it('renders a cancel button', () => {
    const wrapper = setUp();
    const cancelButton = wrapper.find(Button).at(0);
    expect(cancelButton.props().text).to.equal(javalabMsg.cancel());
  });

  it('renders a submit button which calls addCodeReviewComment', () => {
    const addCommentSpy = sinon.spy();
    const wrapper = setUp({addCodeReviewComment: addCommentSpy}, true);
    const submitButton = wrapper.find(Button).at(1);
    expect(submitButton.props().text).to.equal(javalabMsg.submit());

    submitButton.simulate('click');
    expect(addCommentSpy).to.have.been.called;
  });
});

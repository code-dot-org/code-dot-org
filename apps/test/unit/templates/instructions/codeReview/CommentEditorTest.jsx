import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import './CodeReviewTestHelper';
import CommentEditor from '@cdo/apps/templates/instructions/codeReview/CommentEditor';
import Button from '@cdo/apps/templates/Button';
import sinon from 'sinon';

describe('Code Review Comment Editor', () => {
  let wrapper, onCommentUpdate;

  beforeEach(() => {
    onCommentUpdate = sinon.stub();
    wrapper = shallow(
      <CommentEditor
        onNewCommentSubmit={() => {}}
        onNewCommentCancel={() => {}}
        onCommentUpdate={onCommentUpdate}
      />
    );
  });

  it('does not show submit and cancel buttons initially', () => {
    expect(wrapper.find(Button)).to.have.lengthOf(0);
  });

  it('shows submit and cancel buttons once user starts typing', () => {
    expect(wrapper.find(Button)).to.have.lengthOf(0);
    wrapper
      .find('textarea')
      .first()
      .simulate('change', {target: {value: 'a comment'}});
    expect(wrapper.find(Button)).to.have.lengthOf(2);
  });

  it('calls onCommentUpdate callback once user starts typing', () => {
    wrapper
      .find('textarea')
      .first()
      .simulate('change', {target: {value: 'a comment'}});
    sinon.assert.calledOnce(onCommentUpdate);
  });

  it('hides submit and cancel buttons and clears textbox if user hits cancel button', () => {
    const commentTextarea = wrapper.find('textarea').first();
    commentTextarea.simulate('change', {target: {value: 'a comment'}});

    expect(wrapper.find(Button)).to.have.lengthOf(2);
    expect(wrapper.state().comment).to.equal('a comment');

    wrapper
      .find(Button)
      .first()
      .simulate('click');

    expect(wrapper.find(Button)).to.have.lengthOf(0);
    expect(wrapper.state().comment).to.equal('');
  });
});

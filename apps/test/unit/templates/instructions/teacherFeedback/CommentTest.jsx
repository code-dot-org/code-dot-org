import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import Comment from '@cdo/apps/templates/instructions/teacherFeedback/Comment';
import sinon from 'sinon';

const DEFAULT_PROPS = {
  isEditable: true,
  onCommentChange: () => {},
  comment: 'Good Work!',
  placeholderText: 'Add your comment here'
};

describe('Comment', () => {
  it('has a display only textarea isEditable is false', () => {
    const wrapper = shallow(<Comment {...DEFAULT_PROPS} isEditable={false} />);

    const confirmTextArea = wrapper.find('textarea').first();
    expect(confirmTextArea.props().readOnly).to.equal(true);
  });

  it('has a textarea with value of empty string if no comment is given', () => {
    const wrapper = shallow(<Comment {...DEFAULT_PROPS} comment={''} />);

    const confirmTextArea = wrapper.find('textarea').first();
    expect(confirmTextArea.props().value).to.equal('');
  });

  it('updates the text in the comment area', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <Comment {...DEFAULT_PROPS} comment={''} onCommentChange={spy} />
    );
    expect(spy).not.to.have.been.called;

    wrapper
      .find('textarea')
      .first()
      .simulate('change', {target: {value: 'You did great work'}});
    expect(spy).to.have.been.calledOnce.and.calledWith('You did great work');
  });
});

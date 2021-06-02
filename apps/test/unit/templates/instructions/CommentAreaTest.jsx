import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {CommentArea} from '@cdo/apps/templates/instructions/CommentArea';
import sinon from 'sinon';

const DEFAULT_PROPS = {
  isReadonly: false,
  onCommentChange: () => {},
  comment: 'Good Work!',
  placeholderText: 'Add your comment here'
};

describe('CommentArea', () => {
  it('has a display only textarea if in isReadonly', () => {
    const wrapper = shallow(
      <CommentArea {...DEFAULT_PROPS} isReadonly={true} />
    );

    const confirmTextArea = wrapper.find('textarea').first();
    expect(confirmTextArea.props().readOnly).to.equal(true);
  });
  it('has a textarea with value of empty string if no comment is given', () => {
    const wrapper = shallow(<CommentArea {...DEFAULT_PROPS} comment={''} />);

    const confirmTextArea = wrapper.find('textarea').first();
    expect(confirmTextArea.props().value).to.equal('');
  });
  it('updates the text in the comment area', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <CommentArea {...DEFAULT_PROPS} comment={''} onCommentChange={spy} />
    );
    expect(spy).not.to.have.been.called;

    wrapper
      .find('textarea')
      .first()
      .simulate('change', {target: {value: 'You did great work'}});
    expect(spy).to.have.been.calledOnce.and.calledWith('You did great work');
  });
});

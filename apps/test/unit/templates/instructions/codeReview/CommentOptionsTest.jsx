import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import javalabMsg from '@cdo/javalab/locale';
import CommentOptions from '@cdo/apps/templates/instructions/codeReview/CommentOptions';

const DEFAULT_PROPS = {
  isResolved: false,
  onResolveClick: () => {},
  onDeleteClick: () => {}
};

describe('Code Review Comment Options', () => {
  it('renders complete option if comment is not resolved', () => {
    const wrapper = shallow(<CommentOptions {...DEFAULT_PROPS} />);
    expect(wrapper.text().includes(javalabMsg.markResolved())).to.be.true;
  });

  it('renders unmark complete option if comment is resolved', () => {
    const unresolvedCommentProps = {
      ...DEFAULT_PROPS,
      ...{isResolved: true}
    };
    const wrapper = shallow(<CommentOptions {...unresolvedCommentProps} />);
    expect(wrapper.text().includes(javalabMsg.unmarkResolved())).to.be.true;
  });
});

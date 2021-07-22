import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import javalabMsg from '@cdo/javalab/locale';
import CommentOptions from '@cdo/apps/templates/instructions/codeReview/CommentOptions';

const DEFAULT_PROPS = {
  isResolved: false,
  onResolveStateToggle: () => {},
  onDelete: () => {}
};

describe('Code Review Comment Options', () => {
  it('renders resolve option if comment is not resolved', () => {
    const wrapper = shallow(<CommentOptions {...DEFAULT_PROPS} />);
    expect(wrapper.text().includes(javalabMsg.resolve())).to.be.true;
  });

  it('renders unmark resolved option if comment is resolved', () => {
    const unresolvedCommentProps = {
      ...DEFAULT_PROPS,
      ...{isResolved: true}
    };
    const wrapper = shallow(<CommentOptions {...unresolvedCommentProps} />);
    expect(wrapper.text().includes(javalabMsg.reOpen())).to.be.true;
  });
});

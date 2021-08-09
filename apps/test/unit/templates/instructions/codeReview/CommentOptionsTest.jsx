import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import msg from '@cdo/locale';
import javalabMsg from '@cdo/javalab/locale';
import {UnconnectedCommentOptions as CommentOptions} from '@cdo/apps/templates/instructions/codeReview/CommentOptions';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

const DEFAULT_PROPS = {
  isResolved: false,
  onResolveStateToggle: () => {},
  onDelete: () => {},
  viewAs: ViewType.Student
};

describe('Code Review Comment Options', () => {
  it('renders resolve option if comment is not resolved and viewing as student', () => {
    const wrapper = shallow(<CommentOptions {...DEFAULT_PROPS} />);
    expect(wrapper.text().includes(javalabMsg.resolve())).to.be.true;
    expect(wrapper.text().includes(javalabMsg.reOpen())).to.be.false;
    expect(wrapper.text().includes(msg.delete())).to.be.false;
  });

  it('renders re-open option if comment is resolved and viewing as student', () => {
    const unresolvedCommentProps = {
      ...DEFAULT_PROPS,
      ...{isResolved: true}
    };
    const wrapper = shallow(<CommentOptions {...unresolvedCommentProps} />);
    expect(wrapper.text().includes(javalabMsg.reOpen())).to.be.true;
    expect(wrapper.text().includes(javalabMsg.resolve())).to.be.false;
    expect(wrapper.text().includes(msg.delete())).to.be.false;
  });

  it('renders delete option if viewing as teacher', () => {
    const viewAsTeacherProps = {
      ...DEFAULT_PROPS,
      ...{viewAs: ViewType.Teacher}
    };
    const wrapper = shallow(<CommentOptions {...viewAsTeacherProps} />);
    expect(wrapper.text().includes(msg.delete())).to.be.true;
    expect(wrapper.text().includes(javalabMsg.reOpen())).to.be.false;
    expect(wrapper.text().includes(javalabMsg.resolve())).to.be.false;
  });
});

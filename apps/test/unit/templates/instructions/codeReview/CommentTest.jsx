import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {Factory} from 'rosie';
import './CodeReviewTestHelper';
import javalabMsg from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';
import {UnconnectedComment as Comment} from '@cdo/apps/templates/instructions/codeReview/Comment';

const DEFAULT_COMMENT = Factory.build('CodeReviewComment');
const DEFAULT_PROPS = {
  comment: DEFAULT_COMMENT,
  onResolveStateToggle: () => {},
  onDelete: () => {},
  viewAsCodeReviewer: false,
  viewAsTeacher: false
};

describe('Code Review Comment', () => {
  const renderWrapper = (
    overrideCommentAttributes = {},
    overrideProps = {}
  ) => {
    const combinedComment = {...DEFAULT_COMMENT, ...overrideCommentAttributes};
    const combinedProps = {
      ...DEFAULT_PROPS,
      ...overrideProps,
      ...{comment: combinedComment}
    };
    return shallow(<Comment {...combinedProps} />);
  };

  const renderAndCheckBackgroundColor = (
    backgroundColor,
    overrideProps = {}
  ) => {
    const wrapper = renderWrapper(overrideProps);

    const commentBodyStyle = wrapper
      .find('.code-review-comment-body')
      .first()
      .props().style;

    expect(commentBodyStyle).to.have.property(
      'backgroundColor',
      backgroundColor
    );
  };

  it('body has a gray background when not from project owner', () => {
    renderAndCheckBackgroundColor(color.lightest_gray);
  });

  it('body has a blue background when from teacher', () => {
    renderAndCheckBackgroundColor(color.lightest_cyan, {
      isFromTeacher: true
    });
  });

  it('body is grayed out from previous versions of projects', () => {
    renderAndCheckBackgroundColor(color.background_gray, {
      isFromOlderVersionOfProject: true
    });
  });

  it('displays check mark for resolved comment', () => {
    const wrapper = renderWrapper({isResolved: true});
    expect(wrapper.find('.fa-check-circle')).to.have.lengthOf(1);
  });

  it('displays show option for hidden resolved comment', () => {
    const wrapper = renderWrapper({isResolved: true});
    expect(wrapper.find('.fa-eye')).to.have.lengthOf(1);
  });

  it('displays hide option for visible resolved comment', () => {
    const wrapper = renderWrapper({isResolved: true});
    wrapper
      .find('a')
      .first()
      .invoke('onClick')();
    expect(wrapper.find('.fa-eye-slash')).to.have.lengthOf(1);
  });

  it('displays resolve option for code owner', () => {
    const wrapper = renderWrapper({}, {viewAsCodeReviewer: false});
    expect(wrapper.find('.fa-check-circle')).to.have.lengthOf(1);
  });

  it('displays unresolve option for code owner', () => {
    const wrapper = renderWrapper(
      {isResolved: true},
      {viewAsCodeReviewer: false}
    );
    expect(wrapper.find('.fa-circle-o')).to.have.lengthOf(1);
  });

  it('displays delete option for instructor', () => {
    const wrapper = renderWrapper({}, {viewAsTeacher: true});
    expect(wrapper.find('.fa-trash')).to.have.lengthOf(1);
  });

  it('displays error message when comment has error', () => {
    const defaultWrapper = renderWrapper();
    expect(defaultWrapper.text().includes(javalabMsg.commentUpdateError())).to
      .be.false;

    const errorWrapper = renderWrapper({hasError: true});
    expect(errorWrapper.text().includes(javalabMsg.commentUpdateError())).to.be
      .true;
  });
});

import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {Factory} from 'rosie';
import './CodeReviewTestHelper';
import color from '@cdo/apps/util/color';
import Comment from '@cdo/apps/templates/instructions/codeReview/Comment';

const DEFAULT_COMMENT = Factory.build('CodeReviewComment');

describe('Code Review Comment', () => {
  const renderWrapper = (overrideProps = {}) => {
    const combinedComment = {...DEFAULT_COMMENT, ...overrideProps};
    return shallow(
      <Comment
        comment={combinedComment}
        onDelete={() => {}}
        onResolve={() => {}}
      />
    );
  };

  const renderAndCheckBackgroundColor = (
    backgroundColor,
    overrideProps = {}
  ) => {
    const wrapper = renderWrapper(overrideProps);

    const commentBodyStyle = wrapper
      .find('#code-review-comment-body')
      .first()
      .props().style;

    expect(commentBodyStyle).to.have.property(
      'backgroundColor',
      backgroundColor
    );
  };

  it('body has a gray background when not from project owner', () => {
    renderAndCheckBackgroundColor(color.lighter_gray);
  });

  it('body has a blue background when from current user', () => {
    renderAndCheckBackgroundColor(color.lightest_cyan, {
      isFromCurrentUser: true
    });
  });

  it('body is grayed out from previous versions of projects', () => {
    renderAndCheckBackgroundColor(color.background_gray, {
      isFromOlderVersionOfProject: true
    });
  });

  it('displays green check mark for resolved comment', () => {
    const wrapper = renderWrapper({isResolved: true});
    expect(wrapper.find('.fa.fa-check')).to.have.lengthOf(1);
  });

  it('displays error message when comment has error', () => {});
});

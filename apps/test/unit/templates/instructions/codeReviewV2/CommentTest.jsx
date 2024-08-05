import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Factory} from 'rosie';

import './CodeReviewTestHelper';
import {UnconnectedComment as Comment} from '@cdo/apps/templates/instructions/codeReviewV2/Comment';
import color from '@cdo/apps/util/color';

const DEFAULT_COMMENT = Factory.build('CodeReviewV2Comment');
const DEFAULT_PROPS = {
  comment: DEFAULT_COMMENT,
  onResolveStateToggle: () => {},
  onDelete: () => {},
  viewingAsOwner: false,
  currentUserId: 111,
  viewAsTeacher: false,
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
      ...{comment: combinedComment},
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

    expect(commentBodyStyle).toHaveProperty('backgroundColor', backgroundColor);
  };

  it('body has a gray background when not from project owner', () => {
    renderAndCheckBackgroundColor(color.lightest_gray);
  });

  it('body has a blue background when from teacher', () => {
    renderAndCheckBackgroundColor(color.lightest_cyan, {
      isFromTeacher: true,
    });
  });

  it('displays check mark for resolved comment', () => {
    const wrapper = renderWrapper({isResolved: true});
    expect(wrapper.find('FontAwesome').props().icon).toBe('check-circle');
  });

  it('displays show option for hidden resolved comment', () => {
    const wrapper = renderWrapper({isResolved: true});
    expect(wrapper.find('.fa-eye')).toHaveLength(1);
  });

  it('displays hide option for visible resolved comment', () => {
    jest.spyOn(React, 'useRef').mockReturnValue({current: true});

    const wrapper = renderWrapper({isResolved: true});
    const onClickPromise = wrapper.find('a').first().invoke('onClick')();
    return onClickPromise.then(() =>
      expect(wrapper.find('.fa-eye-slash')).toHaveLength(1)
    );
  });

  it('displays resolve option for code owner', () => {
    const wrapper = renderWrapper({}, {viewingAsOwner: true});
    expect(wrapper.find('.fa-check-circle')).toHaveLength(1);
  });

  it('displays unresolve option for code owner', () => {
    const wrapper = renderWrapper({isResolved: true}, {viewingAsOwner: true});
    expect(wrapper.find('.fa-circle-o')).toHaveLength(1);
  });

  it('displays delete option for instructor', () => {
    const wrapper = renderWrapper({}, {viewAsTeacher: true});
    expect(wrapper.find('.fa-trash')).toHaveLength(1);
  });
});

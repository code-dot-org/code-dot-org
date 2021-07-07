import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import color from '@cdo/apps/util/color';
import Comment from '@cdo/apps/templates/instructions/codeReview/Comment';

const DEFAULT_PROPS = {
  id: 1,
  name: 'Charlie Brown',
  comment:
    "Don't worry about the world coming to an end today. It's already tomorrow in Australia.",
  timestampString: '2021/01/01 at 9:30 AM',
  isResolved: false,
  isFromTeacher: false,
  isFromProjectOwner: false,
  isFromOlderVersionOfProject: false
};

describe('Code Review Comment', () => {
  const renderWrapper = (overrideProps = {}) => {
    const combinedProps = {...DEFAULT_PROPS, ...overrideProps};
    return shallow(<Comment {...combinedProps} />);
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

  it('body has a blue background when from project owner', () => {
    renderAndCheckBackgroundColor(color.lightest_cyan, {
      isFromProjectOwner: true
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
});

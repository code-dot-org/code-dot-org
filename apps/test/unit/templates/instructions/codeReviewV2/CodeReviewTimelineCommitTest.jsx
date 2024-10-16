import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {timelineElementType} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewDataApi';
import CodeReviewTimelineCommit from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineCommit';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType,
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import javalabMsg from '@cdo/javalab/locale';

const DEFAULT_PROPS = {
  commit: {
    id: 1,
    createdAt: '2022-03-31T04:58:42.000Z',
    comment: 'This is a comment from your teacher',
    projectVersion: 'asdfjkl',
    timelineElementType: timelineElementType.commit,
  },
  isLastElementInTimeline: false,
};

const setUp = () => {
  return shallow(<CodeReviewTimelineCommit {...DEFAULT_PROPS} />);
};

describe('CodeReviewTimelineCommit', () => {
  it('renders a CodeReviewTimelineElement of type commit', () => {
    const wrapper = setUp();
    const timelineElement = wrapper.find(CodeReviewTimelineElement);
    expect(timelineElement).toHaveLength(1);
    expect(timelineElement.props().type).toBe(
      codeReviewTimelineElementType.COMMIT
    );
  });

  it('passes isLastElementInTimeline and projectVersion to CodeReviewTimelineElement', () => {
    const wrapper = setUp();
    const timelineElementProps = wrapper
      .find(CodeReviewTimelineElement)
      .props();
    expect(timelineElementProps.projectVersionId).toBe(
      DEFAULT_PROPS.commit.projectVersion
    );
    expect(timelineElementProps.isLast).toBe(false);
  });

  it('renders the message Commit', () => {
    const wrapper = setUp();
    expect(wrapper.contains(javalabMsg.commit())).toBe(true);
  });

  it('renders the comment', () => {
    const wrapper = setUp();
    expect(wrapper.contains(DEFAULT_PROPS.commit.comment)).toBe(true);
  });
});

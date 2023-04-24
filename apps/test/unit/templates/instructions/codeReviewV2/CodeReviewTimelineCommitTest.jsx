import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import CodeReviewTimelineCommit from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineCommit';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType,
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import javalabMsg from '@cdo/javalab/locale';
import {timelineElementType} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewDataApi';

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
    expect(timelineElement).to.have.length(1);
    expect(timelineElement.props().type).to.equal(
      codeReviewTimelineElementType.COMMIT
    );
  });

  it('passes isLastElementInTimeline and projectVersion to CodeReviewTimelineElement', () => {
    const wrapper = setUp();
    const timelineElementProps = wrapper
      .find(CodeReviewTimelineElement)
      .props();
    expect(timelineElementProps.projectVersionId).to.equal(
      DEFAULT_PROPS.commit.projectVersion
    );
    expect(timelineElementProps.isLast).to.equal(false);
  });

  it('renders the message Commit', () => {
    const wrapper = setUp();
    expect(wrapper.contains(javalabMsg.commit())).to.be.true;
  });

  it('renders the comment', () => {
    const wrapper = setUp();
    expect(wrapper.contains(DEFAULT_PROPS.commit.comment)).to.be.true;
  });
});

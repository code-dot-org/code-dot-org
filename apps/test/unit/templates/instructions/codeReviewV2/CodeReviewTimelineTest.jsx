import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import CodeReviewTimeline from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimeline';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType,
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import CodeReviewTimelineCommit from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineCommit';
import CodeReviewTimelineReview from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineReview';
import {timelineElementType} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewDataApi';

const DEFAULT_PROPS = {
  timelineData: [
    {
      id: 1,
      createdAt: '2022-03-04T04:58:42.000Z',
      comment: 'First commit',
      projectVersion: 'asdfjkl',
      timelineElementType: timelineElementType.commit,
    },
    {
      id: 1,
      createdAt: '2022-03-15T04:58:42.000Z',
      isOpen: false,
      version: 'asdfjkl',
      timelineElementType: timelineElementType.review,
      comments: [
        {
          id: 123,
          comment: 'Great work on this!',
          commenterName: 'Steve',
          commenterId: 987,
          createdAt: '2022-03-31T04:58:42.000Z',
          isResolved: false,
        },
        {
          id: 124,
          comment: 'Could you add more comments?',
          commenterName: 'Karen',
          commenterId: 654,
          createdAt: '2022-03-31T04:58:42.000Z',
          isResolved: false,
        },
      ],
    },
    {
      id: 2,
      createdAt: '2022-03-20T04:58:42.000Z',
      comment: 'Second commit (after review)',
      projectVersion: 'lkjfds',
      timelineElementType: timelineElementType.commit,
    },
  ],
  addCodeReviewComment: () => {},
  closeReview: () => {},
  toggleResolveComment: () => {},
  deleteCodeReviewComment: () => {},
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<CodeReviewTimeline {...props} />);
};

describe('CodeReviewTimeline', () => {
  it('renders a created node', () => {
    const wrapper = setUp();
    const createdElement = wrapper.find(CodeReviewTimelineElement);
    expect(createdElement).to.have.length(1);
    expect(createdElement.props().type).to.equal(
      codeReviewTimelineElementType.CREATED
    );
    expect(createdElement.props().isLast).to.be.false;
  });

  it('if there is no commit or review data created node will have is last set to true', () => {
    const wrapper = setUp({timelineData: []});
    const createdElement = wrapper.find(CodeReviewTimelineElement);
    expect(createdElement.props().isLast).to.be.true;
  });

  it('renders every commit as a CodeReviewTimelineCommit', () => {
    const wrapper = setUp();
    // For 2 commits in the timelineData array
    expect(wrapper.find(CodeReviewTimelineCommit)).to.have.length(2);
  });

  it('renders every review as a CodeReviewTimelineReview', () => {
    const wrapper = setUp();
    // For 1 review in the timelineData array
    expect(wrapper.find(CodeReviewTimelineReview)).to.have.length(1);
  });

  it('elements have expected isLast property', () => {
    const wrapper = setUp();

    const createdElement = wrapper.childAt(0);
    expect(createdElement.find(CodeReviewTimelineElement)).to.have.length(1);
    expect(createdElement.props().isLast).to.be.false;

    const firstCommit = wrapper.childAt(1);
    expect(firstCommit.find(CodeReviewTimelineCommit)).to.have.length(1);
    expect(firstCommit.props().isLastElementInTimeline).to.be.false;

    const review = wrapper.childAt(2);
    expect(review.find(CodeReviewTimelineReview)).to.have.length(1);
    expect(review.props().isLastElementInTimeline).to.be.false;

    const secondCommit = wrapper.childAt(3);
    expect(secondCommit.find(CodeReviewTimelineCommit)).to.have.length(1);
    expect(secondCommit.props().isLastElementInTimeline).to.be.true;
  });
});

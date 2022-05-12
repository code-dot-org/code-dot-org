import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import CodeReviewTimelineReview from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineReview';
import {codeReviewTimelineElementType} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import javalabMsg from '@cdo/javalab/locale';
import Comment from '@cdo/apps/templates/instructions/codeReview/Comment';
import CodeReviewCommentEditor from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewCommentEditor';
import {timelineElementType} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewDataApi';

const DEFAULT_REVIEW = {
  id: 1,
  createdAt: '2022-03-31T04:58:42.000Z',
  isClosed: false,
  projectVersion: 'asdfjkl',
  isVersionExpired: false,
  timelineElementType: timelineElementType.review,
  comments: [
    {
      id: 123,
      commentText: 'Great work on this!',
      name: 'Steve',
      timestampString: '2022-03-31T04:58:42.000Z',
      isResolved: false
    },
    {
      id: 124,
      commentText: 'Could you add more comments?',
      name: 'Karen',
      timestampString: '2022-03-31T04:58:42.000Z',
      isResolved: false
    }
  ]
};

const DEFAULT_PROPS = {
  review: DEFAULT_REVIEW,
  isLastElementInTimeline: false,
  addCodeReviewComment: () => {},
  closeReview: () => {}
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<CodeReviewTimelineReview {...props} />);
};

describe('CodeReviewTimelineReview', () => {
  it('renders a CodeReviewTimelineElement with type code_review, expected isLast', () => {
    const wrapper = setUp({isLastElementInTimeline: true});
    const timelineElement = wrapper.find('CodeReviewTimelineElement');
    expect(timelineElement.props().type).to.equal(
      codeReviewTimelineElementType.CODE_REVIEW
    );
    expect(timelineElement.props().isLast).to.be.true;
  });

  it('passes project version to CodeReviewTimelineElement', () => {
    const wrapper = setUp();
    const timelineElement = wrapper.find('CodeReviewTimelineElement');
    expect(timelineElement.props().projectVersionId).to.equal('asdfjkl');
  });

  it('passes version expired to CodeReviewTimelineElement', () => {
    let wrapper = setUp();
    let timelineElement = wrapper.find('CodeReviewTimelineElement');
    expect(timelineElement.props().isProjectVersionExpired).to.be.false;

    const expiredVersionReview = {...DEFAULT_REVIEW, isVersionExpired: true};
    wrapper = setUp({review: expiredVersionReview});
    timelineElement = wrapper.find('CodeReviewTimelineElement');
    expect(timelineElement.props().isProjectVersionExpired).to.be.true;
  });

  it('displays the close button if the code review is not closed', () => {
    const wrapper = setUp();
    const closeButton = wrapper.find('Button');
    expect(closeButton).to.have.length(1);
    expect(closeButton.props().text).to.equal(javalabMsg.closeReview());
  });

  it('hides the close button if the code review is closed', () => {
    const review = {...DEFAULT_REVIEW, isClosed: true};
    const wrapper = setUp({review: review});
    expect(wrapper.find('Button')).to.have.length(0);
  });

  it('displays Comments for each comment', () => {
    const wrapper = setUp();
    expect(wrapper.find(Comment)).to.have.length(2);
  });

  it('displays code review disabled note if the review is not closed', () => {
    const wrapper = setUp();
    expect(wrapper.contains(javalabMsg.codeEditingDisabled())).to.be.true;
  });

  it('hides code review disabled note if the review is closed', () => {
    const review = {...DEFAULT_REVIEW, isClosed: true};
    const wrapper = setUp({review: review});
    expect(wrapper.contains(javalabMsg.codeEditingDisabled())).to.be.false;
  });

  it('displays CodeReviewCommentEditor if the review is not closed', () => {
    const review = {...DEFAULT_REVIEW, isClosed: false};
    const wrapper = setUp({review: review});
    expect(wrapper.find(CodeReviewCommentEditor)).to.have.length(1);
  });

  it('hides the CodeReviewCommentEditor if the reveiw is closed', () => {
    const review = {...DEFAULT_REVIEW, isClosed: true};
    const wrapper = setUp({review: review});
    expect(wrapper.find(CodeReviewCommentEditor)).to.have.length(0);
  });
});

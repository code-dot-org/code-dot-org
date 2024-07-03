import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import * as utils from '@cdo/apps/code-studio/utils';
import CodeReviewCommentEditor from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewCommentEditor';
import {timelineElementType} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewDataApi';
import CodeReviewError from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewError';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType,
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import {UnconnectedCodeReviewTimelineReview as CodeReviewTimelineReview} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineReview';
import Comment from '@cdo/apps/templates/instructions/codeReviewV2/Comment';
import javalabMsg from '@cdo/javalab/locale';



const DEFAULT_REVIEW = {
  id: 1,
  createdAt: '2022-03-31T04:58:42.000Z',
  isOpen: true,
  version: 'asdfjkl',
  timelineElementType: timelineElementType.review,
  ownerId: 2,
  ownerName: 'Jerry',
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
};

const DEFAULT_PROPS = {
  review: DEFAULT_REVIEW,
  isLastElementInTimeline: false,
  addCodeReviewComment: () => {},
  closeReview: () => {},
  toggleResolveComment: () => {},
  deleteCodeReviewComment: () => {},
  currentUserId: 1,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<CodeReviewTimelineReview {...props} />);
};

describe('CodeReviewTimelineReview', () => {
  it('renders a CodeReviewTimelineElement with type code_review, expected isLast', () => {
    const wrapper = setUp({isLastElementInTimeline: true});
    const timelineElement = wrapper.find(CodeReviewTimelineElement);
    expect(timelineElement.props().type).toBe(codeReviewTimelineElementType.CODE_REVIEW);
    expect(timelineElement.props().isLast).toBe(true);
  });

  it('passes project version to CodeReviewTimelineElement', () => {
    const wrapper = setUp();
    const timelineElement = wrapper.find(CodeReviewTimelineElement);
    expect(timelineElement.props().projectVersionId).toBe('asdfjkl');
  });

  it('displays your code review header if you are the owner of the review', () => {
    const review = {...DEFAULT_REVIEW, ownerId: 123};
    const wrapper = setUp({review: review, currentUserId: 123});
    expect(wrapper.contains(javalabMsg.codeReviewForYou())).toBe(true);
  });

  it('displays other students code review header if they are the owner', () => {
    const wrapper = setUp();
    expect(
      wrapper.contains(
        javalabMsg.codeReviewForStudent({student: DEFAULT_REVIEW.ownerName})
      )
    ).toBe(true);
  });

  it('displays the close button if the code review is open and viewing as owner', () => {
    const review = {...DEFAULT_REVIEW, isOpen: true, ownerId: 1};
    const wrapper = setUp({review: review, currentUserId: 1});
    const closeButton = wrapper.find('Button');
    expect(closeButton).toHaveLength(1);
    expect(closeButton.props().text).toBe(javalabMsg.closeReview());
  });

  it('calls prop closeReview when close is clicked does not display codeReviewError if successful', () => {
    const closeReviewStub = jest.fn()
      .callsFake((successCallback, failureCallback) => {
        successCallback();
      });
    const review = {...DEFAULT_REVIEW, isOpen: true, ownerId: 1};
    const wrapper = setUp({
      review: review,
      currentUserId: 1,
      closeReview: closeReviewStub,
    });
    const closeButton = wrapper.find('Button');
    closeButton.simulate('click');

    expect(closeReviewStub).toHaveBeenCalled();
    wrapper.update();
    expect(wrapper.find(CodeReviewError)).toHaveLength(0);
  });

  it('calls prop closeReview when close is clicked displays codeReviewError if fails', () => {
    const closeReviewStub = jest.fn()
      .callsFake((successCallback, failureCallback) => {
        failureCallback();
      });
    const review = {...DEFAULT_REVIEW, isOpen: true, ownerId: 1};
    const wrapper = setUp({
      review: review,
      currentUserId: 1,
      closeReview: closeReviewStub,
    });
    const closeButton = wrapper.find('Button');
    closeButton.simulate('click');

    expect(closeReviewStub).toHaveBeenCalled();
    wrapper.update();
    expect(wrapper.find(CodeReviewError)).toHaveLength(1);
  });

  it('hides the close button if the code review is closed', () => {
    const review = {...DEFAULT_REVIEW, isOpen: false};
    const wrapper = setUp({review: review});
    expect(wrapper.find('Button')).toHaveLength(0);
  });

  it('hides the close button if the current user is not the owner of the review', () => {
    const review = {...DEFAULT_REVIEW, isOpen: true, ownerId: 1};
    const wrapper = setUp({review: review, currentUserId: 2});
    expect(wrapper.find('Button')).toHaveLength(0);
  });

  it('hides the close button if viewing an older version of the project', () => {
    jest.spyOn(utils, 'queryParams').mockClear().mockReturnValue('versionParam');
    // Viewing own project with open code review
    const review = {...DEFAULT_REVIEW, isOpen: true, ownerId: 1};
    const wrapper = setUp({review: review, currentUserId: 1});
    expect(wrapper.find('Button')).toHaveLength(0);
    utils.queryParams.mockRestore();
  });

  it('displays Comments for each comment', () => {
    const wrapper = setUp();
    expect(wrapper.find(Comment)).toHaveLength(2);
  });

  it('displays message for closed review with no comments', () => {
    const review = {...DEFAULT_REVIEW, comments: [], isOpen: false};
    const wrapper = setUp({review});
    expect(wrapper.find(Comment)).toHaveLength(0);
    expect(wrapper.contains(javalabMsg.noFeedbackGiven())).toBe(true);
  });

  it('displays code review disabled note if the review is open and viewing as owner', () => {
    const review = {...DEFAULT_REVIEW, isOpen: true, ownerId: 1};
    const wrapper = setUp({review: review, currentUserId: 1});
    expect(wrapper.contains(javalabMsg.codeEditingDisabled())).toBe(true);
  });

  it('hides code review disabled note if the review is closed', () => {
    const review = {...DEFAULT_REVIEW, isOpen: false};
    const wrapper = setUp({review: review});
    expect(wrapper.contains(javalabMsg.codeEditingDisabled())).toBe(false);
  });

  it('hides code review disabled note if as not the owner', () => {
    const review = {...DEFAULT_REVIEW, isOpen: true, ownerId: 1};
    const wrapper = setUp({review: review, currentUserId: 2});
    expect(wrapper.contains(javalabMsg.codeEditingDisabled())).toBe(false);
  });

  it('displays CodeReviewCommentEditor if the review is open and viewing as not the owner', () => {
    const review = {...DEFAULT_REVIEW, isOpen: true, ownerId: 1};
    const wrapper = setUp({review: review, currentUserId: 2});
    expect(wrapper.find(CodeReviewCommentEditor)).toHaveLength(1);
  });

  it('hides the CodeReviewCommentEditor if the review is closed', () => {
    const review = {...DEFAULT_REVIEW, isOpen: false};
    const wrapper = setUp({review: review, viewAsCodeReviewer: true});
    expect(wrapper.find(CodeReviewCommentEditor)).toHaveLength(0);
  });

  // By design, the user will not leave notes on their own code review
  it('hides the CodeReviewCommentEditor if the review is open and viewing as the owner', () => {
    const review = {
      ...DEFAULT_REVIEW,
      isOpen: true,
      ownerId: 1,
    };
    const wrapper = setUp({review: review, currentUserId: 1});
    expect(wrapper.find(CodeReviewCommentEditor)).toHaveLength(0);
  });

  // Note: teachers can view older version of student projects
  it('hides the CodeReviewCommentEditor if viewing an older version of the project', () => {
    jest.spyOn(utils, 'queryParams').mockClear().mockReturnValue('versionParam');
    const review = {...DEFAULT_REVIEW, isOpen: true, ownerId: 1};
    const wrapper = setUp({review: review, currentUserId: 2});
    expect(wrapper.find(CodeReviewCommentEditor)).toHaveLength(0);
    utils.queryParams.mockRestore();
  });
});

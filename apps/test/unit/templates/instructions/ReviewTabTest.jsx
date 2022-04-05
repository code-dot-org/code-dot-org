import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import {Factory} from 'rosie';
import './codeReview/CodeReviewTestHelper';
import {UnconnectedReviewTab as ReviewTab} from '@cdo/apps/templates/instructions/ReviewTab';
import Comment from '@cdo/apps/templates/instructions/codeReview/Comment';
import CommentEditor from '@cdo/apps/templates/instructions/codeReview/CommentEditor';
import ReviewNavigator from '@cdo/apps/templates/instructions/codeReview/ReviewNavigator';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import Button from '@cdo/apps/templates/Button';

describe('Code Review Tab', () => {
  const channelId = 'test123';
  const serverLevelId = 123;
  const serverScriptId = 123;
  const reviewableProjectId = 'reviewableProjectId123';

  const autoResolveApiCall = () => {
    return {
      done: callback => {
        callback();
        return {
          fail: () => {}
        };
      }
    };
  };

  const autoFailApiCall = () => {
    return {
      done: () => {
        return {
          fail: errorCallback => errorCallback()
        };
      }
    };
  };

  let wrapper, onLoadComplete, mockApi, existingComment;

  beforeEach(() => {
    existingComment = Factory.build('CodeReviewComment');
    mockApi = {};

    mockApi.getCodeReviewCommentsForProject = onDone => {
      onDone([existingComment]);
    };

    mockApi.deleteCodeReviewComment = autoResolveApiCall;
    mockApi.resolveCodeReviewComment = autoResolveApiCall;

    // Stub with defaults because this API call is always made on mount
    stubReviewableStatusProjectApiCall({
      canMarkReviewable: false,
      reviewEnabled: true
    });

    onLoadComplete = sinon.spy();
  });

  describe('viewing as code owner with review enabled', () => {
    function createWrapper() {
      return shallow(
        <ReviewTab
          onLoadComplete={onLoadComplete}
          codeReviewEnabled
          viewAsCodeReviewer={false}
          channelId={channelId}
          serverLevelId={serverLevelId}
          serverScriptId={serverScriptId}
          dataApi={mockApi}
        />
      );
    }

    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('renders loading spinner before load is completed', () => {
      expect(wrapper.find(Spinner).length).to.equal(1);
    });

    it('calls onLoadComplete callback after load is completed', () => {
      onLoadComplete.resetHistory();
      sinon.assert.notCalled(onLoadComplete);

      wrapper.setState({loadingReviewData: false});
      sinon.assert.calledOnce(onLoadComplete);
    });

    describe('after load', () => {
      beforeEach(() => {
        wrapper.setState({loadingReviewData: false});
      });

      it('renders without error if project has no comments', () => {
        mockApi.getCodeReviewCommentsForProject = onDone => {
          onDone([]);
        };

        // Need to recreate the wrapper so the right comments are loaded on mount
        wrapper = createWrapper();
        wrapper.setState({loadingReviewData: false});

        expect(wrapper.find(Comment).length).to.equal(0);
      });

      it('renders a comment fetched on mount if one exists', () => {
        // Need to recreate the wrapper so the right comments are loaded on mount
        wrapper = createWrapper();
        wrapper.setState({loadingReviewData: false});

        expect(wrapper.find(Comment).length).to.equal(1);
      });

      it('submits request and shows new comment after one is created', () => {
        const testCommentText = 'test comment text';
        const newlyCreatedComment = Factory.build('CodeReviewComment', {
          commentText: testCommentText
        });

        mockApi.submitNewCodeReviewComment = () => {
          return {
            then: callback => {
              callback(newlyCreatedComment);
              return {
                catch: () => {}
              };
            }
          };
        };

        expect(wrapper.find(Comment).length).to.equal(1);

        wrapper.instance().onNewCommentSubmit(testCommentText);

        const comment = wrapper.find(Comment);
        expect(comment.length).to.equal(2);
        expect(comment.at(1).props().comment.commentText).to.equal(
          testCommentText
        );
      });

      it('hides comment box if there is an authorization error on comment', () => {
        // first, enable peer review
        stubReviewableStatusProjectApiCall({
          canMarkReviewable: false,
          reviewEnabled: true
        });

        const testCommentText = 'test comment text';

        // initial server response loads a comment
        expect(wrapper.find(CommentEditor).length).to.equal(1);
        expect(wrapper.find(Comment).length).to.equal(1);

        // fake a 404 for saving a comment
        stubSubmitCommentError({status: 404});

        wrapper.instance().onNewCommentSubmit(testCommentText);
        // should still only have 1 comment, not 2
        expect(wrapper.find(Comment).length).to.equal(1);
        expect(wrapper.find(CommentEditor).length).to.equal(0);
        expect(wrapper.state().authorizationError).to.be.true;
      });

      it('displays error message if comment contains profanity', () => {
        // first, enable peer review
        stubReviewableStatusProjectApiCall({
          canMarkReviewable: false,
          reviewEnabled: true
        });

        const testCommentText = 'test comment text';
        const profanityErrorMessage = 'profanity error';

        // initial server response loads a comment
        expect(wrapper.find(CommentEditor).length).to.equal(1);
        expect(wrapper.find(Comment).length).to.equal(1);

        // fake a profanity error
        stubSubmitCommentError({profanityFoundError: profanityErrorMessage});

        wrapper.instance().onNewCommentSubmit(testCommentText);
        // should still only have 1 comment, not 2
        expect(wrapper.find(Comment).length).to.equal(1);
        // Comment editor should still be visible
        expect(wrapper.find(CommentEditor).length).to.equal(1);
        expect(wrapper.state().commentSaveError).to.be.true;
        expect(wrapper.state().commentSaveErrorMessage).to.equal(
          profanityErrorMessage
        );
      });

      it('removes a comment when one is deleted', () => {
        expect(wrapper.find(Comment).length).to.equal(1);
        wrapper.instance().onCommentDelete(existingComment.id);
        expect(wrapper.find(Comment).length).to.equal(0);
      });

      it('resolves a comment when one is resolved', () => {
        expect(
          wrapper
            .find(Comment)
            .at(0)
            .props().comment.isResolved
        ).to.be.false;
        wrapper
          .instance()
          .onCommentResolveStateToggle(existingComment.id, true);
        expect(
          wrapper
            .find(Comment)
            .at(0)
            .props().comment.isResolved
        ).to.be.true;
      });

      it('sets hasError to true when comment update request fails and does not update comment', () => {
        let firstComment = wrapper.find(Comment).at(0);
        expect(firstComment.props().comment.hasError).to.be.undefined;
        expect(firstComment.props().comment.isResolved).to.be.false;

        mockApi.resolveCodeReviewComment = autoFailApiCall;

        wrapper
          .instance()
          .onCommentResolveStateToggle(existingComment.id, true);
        firstComment = wrapper.find(Comment).at(0);
        expect(firstComment.props().comment.hasError).to.be.true;
        expect(firstComment.props().comment.isResolved).to.be.false;
      });

      it('sets hasError to true when comment delete request fails and does not remove comment from UI', () => {
        mockApi.deleteCodeReviewComment = autoFailApiCall;

        expect(
          wrapper
            .find(Comment)
            .at(0)
            .props().comment.hasError
        ).to.be.undefined;
        wrapper.instance().onCommentDelete(existingComment.id, true);
        expect(
          wrapper
            .find(Comment)
            .at(0)
            .props().comment.hasError
        ).to.be.true;
      });

      it('shows the review checkbox if enabled', () => {
        stubReviewableStatusProjectApiCall({
          canMarkReviewable: true,
          reviewEnabled: true,
          id: reviewableProjectId
        });

        wrapper = createWrapper();
        wrapper.setState({loadingReviewData: false});

        const input = wrapper.find('input');
        expect(input).to.exist;
        expect(input.props().checked).to.be.true;
      });

      it('hides the review checkbox if disabled', () => {
        stubReviewableStatusProjectApiCall({
          canMarkReviewable: false,
          reviewEnabled: false
        });

        wrapper = createWrapper();
        wrapper.setState({loadingReviewData: false});

        expect(wrapper.find('input')).to.be.empty;
      });

      it('shows comment input if peer review enabled', () => {
        stubReviewableStatusProjectApiCall({
          canMarkReviewable: false,
          reviewEnabled: true
        });

        wrapper = createWrapper();
        wrapper.setState({loadingReviewData: false});

        expect(wrapper.find(CommentEditor).length).to.equal(1);
      });

      it('hides comment input if peer review disabled', () => {
        stubReviewableStatusProjectApiCall({
          canMarkReviewable: false,
          reviewEnabled: false
        });

        wrapper = createWrapper();
        wrapper.setState({loadingReviewData: false});

        expect(wrapper.find(CommentEditor).length).to.equal(0);
      });

      it('shows the ReviewNavigator if viewing own project', () => {
        expect(wrapper.find(ReviewNavigator).length).to.equal(1);
      });

      it('reloads data on clicking refresh button', () => {
        expect(wrapper.state().loadingReviewData).to.be.false;
        expect(wrapper.find(Button).length).to.equal(1);
        wrapper
          .find(Button)
          .first()
          .invoke('onClick')();

        expect(wrapper.state().loadingReviewData).to.be.true;
      });
    });
  });

  describe('viewing as instructor with review enabled', () => {
    beforeEach(() => {
      wrapper = shallow(
        <ReviewTab
          onLoadComplete={onLoadComplete}
          codeReviewEnabled={false}
          viewAsCodeReviewer={false}
          viewAsTeacher={true}
          channelId={channelId}
          serverLevelId={serverLevelId}
          serverScriptId={serverScriptId}
        />
      );
    });

    it('always shows comment input', () => {
      stubReviewableStatusProjectApiCall({
        canMarkReviewable: false,
        reviewEnabled: false
      });

      wrapper.setState({loadingReviewData: false});
      expect(wrapper.find(CommentEditor).length).to.equal(1);
    });

    it('does not show the ReviewNavigator', () => {
      expect(wrapper.find(ReviewNavigator).length).to.equal(0);
    });
  });

  it('does not render enable code review checkbox when codeReviewEnabled is false', () => {
    wrapper = shallow(
      <ReviewTab
        onLoadComplete={onLoadComplete}
        codeReviewEnabled={false}
        viewAsCodeReviewer={false}
      />
    );
    expect(wrapper.find("input[type='checkbox']").length).to.equal(0);
  });

  function stubReviewableStatusProjectApiCall(reviewableStatus) {
    mockApi.getPeerReviewStatus = () => {
      return {
        done: callback => {
          callback(reviewableStatus);
          return {
            fail: () => {}
          };
        }
      };
    };
  }

  function stubSubmitCommentError(error) {
    mockApi.submitNewCodeReviewComment = () => {
      return {
        then: () => {
          return {
            catch: callback => {
              callback(error);
            }
          };
        }
      };
    };
  }
});

import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import {Factory} from 'rosie';
import './codeReview/CodeReviewTestHelper';
import ReviewTab from '@cdo/apps/templates/instructions/ReviewTab';
import Comment from '@cdo/apps/templates/instructions/codeReview/Comment';
import CommentEditor from '@cdo/apps/templates/instructions/codeReview/CommentEditor';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';

describe('Code Review Tab', () => {
  const token = 'token';
  const channelId = 'test123';
  const serverLevelId = 'serverLevelId123';
  const serverScriptId = 'serverScriptId123';
  const reviewableProjectId = 'reviewableProjectId123';
  const existingComment = Factory.build('CodeReviewComment');
  let wrapper, server;

  beforeEach(() => {
    server = sinon.fakeServer.create();
    server.respondWith(
      'GET',
      `/code_review_comments/project_comments?channel_id=${channelId}`,
      [
        200,
        {
          'Content-Type': 'application/json',
          'csrf-token': token
        },
        JSON.stringify([existingComment])
      ]
    );

    stubRedux();
    registerReducers(commonReducers);
    getStore().dispatch(
      setPageConstants({
        channelId,
        serverLevelId,
        serverScriptId
      })
    );

    wrapper = shallow(<ReviewTab />);
  });

  afterEach(() => {
    server.restore();
    restoreRedux();
  });

  it('renders without error if project has no comments', () => {
    server.respondWith(
      'GET',
      `/code_review_comments/project_comments?channel_id=${channelId}`,
      [200, {'Content-Type': 'application/json'}, JSON.stringify([])]
    );
    server.respond();

    expect(wrapper.find(Comment).length).to.equal(0);
  });

  it('renders a comment fetched on mount if one exists', () => {
    expect(wrapper.find(Comment).length).to.equal(0);
    server.respond();
    expect(wrapper.find(Comment).length).to.equal(1);
  });

  it('submits request and shows new comment after one is created', () => {
    const testCommentText = 'test comment text';
    const newlyCreatedComment = Factory.build('CodeReviewComment', {
      commentText: testCommentText
    });

    server.respondWith('POST', '/code_review_comments', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(newlyCreatedComment)
    ]);

    server.respond();
    expect(wrapper.find(Comment).length).to.equal(1);

    wrapper.instance().onNewCommentSubmit(testCommentText);
    server.respond();
    expect(wrapper.find(Comment).length).to.equal(2);
    expect(
      wrapper
        .find(Comment)
        .at(1)
        .props().comment.commentText
    ).to.equal(testCommentText);
  });

  it('removes a comment when one is deleted', () => {
    server.respond();

    expect(wrapper.find(Comment).length).to.equal(1);
    wrapper.instance().onCommentDelete(existingComment.id);
    expect(wrapper.find(Comment).length).to.equal(0);
  });

  it('resolves a comment when one is resolved', () => {
    server.respond();

    expect(
      wrapper
        .find(Comment)
        .at(0)
        .props().comment.isResolved
    ).to.be.false;
    wrapper.instance().onCommentResolveStateToggle(existingComment.id);
    expect(
      wrapper
        .find(Comment)
        .at(0)
        .props().comment.isResolved
    ).to.be.true;
  });

  it('shows the review checkbox if enabled', () => {
    stubReviewableStatusProjectServerCall({
      canMarkReviewable: true,
      reviewEnabled: true,
      id: reviewableProjectId
    });

    const input = wrapper.find('input');
    expect(input).to.exist;
    expect(input.props().checked).to.be.true;
  });

  it('hides the review checkbox if disabled', () => {
    stubReviewableStatusProjectServerCall({
      canMarkReviewable: false,
      reviewEnabled: false
    });

    const input = wrapper.find('input');
    expect(input).to.be.empty;
  });

  it('shows comment input if peer review enabled', () => {
    stubReviewableStatusProjectServerCall({
      canMarkReviewable: false,
      reviewEnabled: true
    });

    expect(wrapper.find(CommentEditor).length).to.equal(1);
  });

  it('hides comment input if peer review enabled', () => {
    stubReviewableStatusProjectServerCall({
      canMarkReviewable: false,
      reviewEnabled: false
    });

    expect(wrapper.find(CommentEditor).length).to.equal(0);
  });

  function stubReviewableStatusProjectServerCall(reviewableStatus) {
    server.respondWith(
      'GET',
      `/reviewable_projects/reviewable_status?channel_id=${channelId}&level_id=${serverLevelId}&script_id=${serverScriptId}`,
      [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(reviewableStatus)
      ]
    );

    server.respond();
  }
});

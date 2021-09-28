import $ from 'jquery';

export default class CodeReviewDataApi {
  constructor(channelId, levelId, scriptId) {
    this.channelId = channelId;
    this.levelId = levelId;
    this.scriptId = scriptId;
  }

  getCodeReviewCommentsForProject() {
    return $.ajax({
      url: `/code_review_comments/project_comments`,
      method: 'GET',
      data: {channel_id: this.channelId}
    });
  }

  getPeerReviewStatus() {
    return $.ajax({
      url: `/reviewable_projects/reviewable_status`,
      type: 'GET',
      data: {
        channel_id: this.channelId,
        level_id: this.levelId,
        script_id: this.scriptId
      }
    });
  }

  getReviewablePeers() {
    return $.ajax({
      url: `/reviewable_projects/for_level`,
      type: 'GET',
      data: {
        channel_id: this.channelId,
        level_id: this.levelId,
        script_id: this.scriptId
      }
    });
  }

  submitNewCodeReviewComment(commentText, token) {
    return $.ajax({
      url: `/code_review_comments`,
      type: 'POST',
      headers: {'X-CSRF-Token': token},
      data: {
        channel_id: this.channelId,
        script_id: this.scriptId,
        level_id: this.levelId,
        comment: commentText
      }
    });
  }

  resolveCodeReviewComment(commentId, resolvedStatus, token) {
    return $.ajax({
      url: `/code_review_comments/${commentId}/toggle_resolved`,
      type: 'PATCH',
      headers: {'X-CSRF-Token': token},
      data: {is_resolved: resolvedStatus}
    });
  }

  deleteCodeReviewComment(commentId, token) {
    return $.ajax({
      url: `/code_review_comments/${commentId}`,
      type: 'DELETE',
      headers: {'X-CSRF-Token': token}
    });
  }

  enablePeerReview(token) {
    return $.ajax({
      url: `/reviewable_projects`,
      type: 'POST',
      headers: {'X-CSRF-Token': token},
      data: {
        channel_id: this.channelId,
        level_id: this.levelId,
        script_id: this.scriptId
      }
    });
  }

  disablePeerReview(projectId, token) {
    return $.ajax({
      url: `/reviewable_projects/${projectId}`,
      headers: {'X-CSRF-Token': token},
      method: `DELETE`
    });
  }
}

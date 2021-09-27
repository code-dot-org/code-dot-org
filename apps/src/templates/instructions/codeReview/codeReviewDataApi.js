import $ from 'jquery';

export class dataApi {
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
}

export function submitNewCodeReviewComment(
  commentText,
  channelId,
  scriptId,
  levelId,
  token
) {
  return $.ajax({
    url: `/code_review_comments`,
    type: 'POST',
    headers: {'X-CSRF-Token': token},
    data: {
      channel_id: channelId,
      script_id: scriptId,
      level_id: levelId,
      comment: commentText
    }
  });
}

export function enablePeerReview(channelId, levelId, scriptId, token) {
  return $.ajax({
    url: `/reviewable_projects`,
    type: 'POST',
    headers: {'X-CSRF-Token': token},
    data: {
      channel_id: channelId,
      level_id: levelId,
      script_id: scriptId
    }
  });
}

export function disablePeerReview(projectId, token) {
  return $.ajax({
    url: `/reviewable_projects/${projectId}`,
    headers: {'X-CSRF-Token': token},
    method: `DELETE`
  });
}

export function resolveCodeReviewComment(commentId, resolvedStatus, token) {
  return $.ajax({
    url: `/code_review_comments/${commentId}/toggle_resolved`,
    type: 'PATCH',
    headers: {'X-CSRF-Token': token},
    data: {is_resolved: resolvedStatus}
  });
}

export function deleteCodeReviewComment(commentId, token) {
  return $.ajax({
    url: `/code_review_comments/${commentId}`,
    type: 'DELETE',
    headers: {'X-CSRF-Token': token}
  });
}

import $ from 'jquery';

export function getCodeReviewCommentsForProject(channelId) {
  return $.ajax({
    url: `/code_review_comments/project_comments`,
    method: 'GET',
    data: {channel_id: channelId}
  });
}

export function submitNewCodeReviewComment(commentText, channelId, token) {
  return $.ajax({
    url: `/code_review_comments`,
    type: 'POST',
    headers: {'X-CSRF-Token': token},
    data: {
      channel_id: channelId,
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

export function getPeerReviewStatus(channelId, levelId, scriptId) {
  return $.ajax({
    url: `/reviewable_projects/reviewable_status`,
    type: 'GET',
    data: {
      channel_id: channelId,
      level_id: levelId,
      script_id: scriptId
    }
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

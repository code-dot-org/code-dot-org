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

export function resolveCodeReviewComment(commentId, resolvedStatus, token) {
  return $.ajax({
    url: `/code_review_comments/${commentId}/resolve`,
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

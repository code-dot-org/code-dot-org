import $ from 'jquery';

export function getCodeReviewCommentsForProject(channelId, projectVersion) {
  return $.ajax({
    url: `/code_review_comments/project_comments`,
    method: 'GET',
    data: {
      channel_id: channelId,
      project_version: projectVersion
    }
  });
}

export function submitNewCodeReviewComment(
  commentText,
  channelId,
  projectVersion,
  token
) {
  return $.ajax({
    url: `/code_review_comments`,
    type: 'POST',
    headers: {'X-CSRF-Token': token},
    data: {
      channel_id: channelId,
      project_version: 'latest',
      comment: commentText
    }
  });
}

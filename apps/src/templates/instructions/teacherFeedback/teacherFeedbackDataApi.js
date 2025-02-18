import $ from 'jquery';

export function updateTeacherFeedback(payload, token) {
  return $.ajax({
    url: '/api/v1/teacher_feedbacks',
    method: 'POST',
    contentType: 'application/json;charset=UTF-8',
    dataType: 'json',
    data: JSON.stringify({teacher_feedback: payload}),
    headers: {'X-CSRF-Token': token},
  }).done(data => data);
}

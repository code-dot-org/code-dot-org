import $ from 'jquery';

export function getTeacherFeedbackForStudent(studentId, levelId) {
  return $.ajax({
    url: `/api/v1/teacher_feedbacks/get_feedbacks?student_id=${studentId}&level_id=${levelId}`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8'
  });
}

export function getRubric(levelId) {
  return $.ajax({
    url: `/levels/${levelId}/get_rubric`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8'
  });
}

export function getTeacherFeedbackForTeacher(studentId, levelId, teacherId) {
  return $.ajax({
    url: `/api/v1/teacher_feedbacks/get_feedback_from_teacher?student_id=${studentId}&level_id=${levelId}&teacher_id=${teacherId}`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8'
  });
}

export function incrementVisitCount(latestFeedbackId, token) {
  return $.ajax({
    url: `/api/v1/teacher_feedbacks/${latestFeedbackId}/increment_visit_count`,
    method: 'POST',
    contentType: 'application/json;charset=UTF-8',
    headers: {'X-CSRF-Token': token}
  });
}

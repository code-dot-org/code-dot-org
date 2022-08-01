import $ from 'jquery';

export function getTeacherFeedbackForStudent(studentId, levelId, scriptId) {
  return $.ajax({
    url: `/api/v1/teacher_feedbacks/get_feedbacks?student_id=${studentId}&level_id=${levelId}&script_id=${scriptId}`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8'
  });
}

// TODO (maureen): move this to teacher feedback data api only used by feedback tab
export function getAllTeacherFeedbackForStudent(studentId, levelId, scriptId) {
  return $.ajax({
    url: `/api/v1/teacher_feedbacks/get_all_feedbacks?student_id=${studentId}&level_id=${levelId}&script_id=${scriptId}`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8'
  });
}

// TODO (maureen): move this to teacher feedback data api only used by feedback tab
export function getAllTeacherFeedbackForTeacher(
  studentId,
  levelId,
  teacherId,
  scriptId
) {
  return $.ajax({
    url: `/api/v1/teacher_feedbacks/get_all_feedback_from_teacher?student_id=${studentId}&level_id=${levelId}&teacher_id=${teacherId}&script_id=${scriptId}`,
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

export function getTeacherFeedbackForTeacher(
  studentId,
  levelId,
  teacherId,
  scriptId
) {
  return $.ajax({
    url: `/api/v1/teacher_feedbacks/get_feedback_from_teacher?student_id=${studentId}&level_id=${levelId}&teacher_id=${teacherId}&script_id=${scriptId}`,
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

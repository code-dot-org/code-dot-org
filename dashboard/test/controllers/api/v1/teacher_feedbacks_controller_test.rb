require 'test_helper'

class Api::V1::TeacherFeedbacksControllerTest < ActionDispatch::IntegrationTest
  API = '/api/v1/teacher_feedbacks'

  test 'can be created' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level = create :level

    sign_in teacher
    params = {
      student_id: student.id,
      level_id:  level.id,
      comment: "good job"
    }

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params}
      assert_response :success
    end

    teacher_feedback = TeacherFeedback.last
    assert_equal student.id, teacher_feedback.student_id
    assert_equal level.id, teacher_feedback.level_id
    assert_equal teacher.id, teacher_feedback.teacher_id
  end

  test 'forbidden with missing parameters' do
    teacher = create :teacher
    sign_in teacher
    params = {
      student_id: 1,
      level_id: ActiveRecord::FixtureSet.identify(:level_1),
    }
    post API, params: {teacher_feedback: params}

    assert_response :forbidden
  end

  test 'forbidden to leave feedback for student not in teacher section' do
    teacher = create :teacher
    student = create :student
    level = create :level
    sign_in teacher
    params = {
      student_id: student.id,
      level_id:  level.id,
      comment: "good job"
    }

    post API, params: {teacher_feedback: params}

    assert_response :forbidden
  end

  test 'can be retrieved by teacher' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level = create :level
    comment = "Retrieved"

    sign_in teacher
    params = {
      student_id: student.id,
      level_id:  level.id,
      comment: comment
    }

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params}
      assert_response :success
    end

    get "#{API}/show_feedback_from_teacher?student_id=#{student.id}&level_id=#{level.id}&teacher_id=#{teacher.id}"

    assert_equal comment, JSON.parse(@response.body)['comment']
  end

  test 'retrieves feedback for correct student' do
    teacher = create :teacher
    student1 = create :student
    student2 = create :student
    section = create :section, user: teacher
    section.add_student(student1)
    section.add_student(student2)
    level = create :level
    comment1 = "Student Alpha"
    comment2 = "Student Beta"

    sign_in teacher
    params1 = {
      student_id: student1.id,
      level_id:  level.id,
      comment: comment1
    }

    params2 = {
      student_id: student2.id,
      level_id:  level.id,
      comment: comment2
    }

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params1}
      assert_response :success
    end

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params2}
      assert_response :success
    end

    get "#{API}/show_feedback_from_teacher?student_id=#{student1.id}&level_id=#{level.id}&teacher_id=#{teacher.id}"

    assert_response :success
    assert_equal student1.id, JSON.parse(@response.body)['student_id']
    assert_equal comment1, JSON.parse(@response.body)['comment']
  end

  test 'retrieves feedback from correct teacher' do
    teacher1 = create :teacher
    teacher2 = create :teacher
    student = create :student
    section1 = create :section, user: teacher1
    section2 = create :section, user: teacher2
    section1.add_student(student)
    section2.add_student(student)
    level = create :level
    comment1 = "Student Alpha"
    comment2 = "Student Beta"

    sign_in teacher1
    params1 = {
      student_id: student.id,
      level_id:  level.id,
      comment: comment1
    }

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params1}
      assert_response :success
    end
    sign_out teacher1

    sign_in teacher2
    params2 = {
      student_id: student.id,
      level_id:  level.id,
      comment: comment2
    }
    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params2}
      assert_response :success
    end
    sign_out teacher2

    sign_in teacher1

    get "#{API}/show_feedback_from_teacher?student_id=#{student.id}&level_id=#{level.id}&teacher_id=#{teacher1.id}"
    assert_equal comment1, JSON.parse(@response.body)['comment']

    get "#{API}/show_feedback_from_teacher?student_id=#{student.id}&level_id=#{level.id}&teacher_id=#{teacher2.id}"
    assert_equal comment2, JSON.parse(@response.body)['comment']
  end

  test 'retrieves comment on requested level when teacher has given student feedback on multiple levels' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level1 = create :level
    level2 = create :level
    level3 = create :level
    comment1 = "Comment Alpha"
    comment2 = "Comment Beta"
    comment3 = "Comment Theta"

    sign_in teacher
    params1 = {
      student_id: student.id,
      level_id:  level1.id,
      comment: comment1
    }

    params2 = {
      student_id: student.id,
      level_id:  level2.id,
      comment: comment2
    }

    params3 = {
      student_id: student.id,
      level_id:  level3.id,
      comment1: comment3
    }

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params1}
      assert_response :success
    end

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params2}
      assert_response :success
    end

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params3}
      assert_response :success
    end

    get "#{API}/show_feedback_from_teacher?student_id=#{student.id}&level_id=#{level2.id}&teacher_id=#{teacher.id}"

    assert_equal comment2, JSON.parse(@response.body)['comment']
  end

  test 'retrieves the most recent comment from a teacher' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level = create :level
    comment1 = "First"
    comment2 = "Second"
    comment3 = "Third"

    sign_in teacher
    params1 = {
      student_id: student.id,
      level_id:  level.id,
      comment: comment1
    }

    params2 = {
      student_id: student.id,
      level_id:  level.id,
      comment: comment2
    }

    params3 = {
      student_id: student.id,
      level_id:  level.id,
      comment: comment3
    }

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params1}
      assert_response :success
    end

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params2}
      assert_response :success
    end

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params3}
      assert_response :success
    end

    get "#{API}/show_feedback_from_teacher?student_id=#{student.id}&level_id=#{level.id}&teacher_id=#{teacher.id}"

    assert_equal comment3, JSON.parse(@response.body)['comment']
  end
end

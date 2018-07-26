require 'test_helper'

class Api::V1::TeacherFeedbacksControllerTest < ActionDispatch::IntegrationTest
  API = '/api/v1/teacher_feedbacks'
  COMMENT1 = 'Comment Alpha'
  COMMENT2 = 'Comment Beta'
  COMMENT3 = 'Comment Gamma'

  self.use_transactional_test_case = true
  setup_all do
    #create student, teacher, and level and register student in teacher's section
    @teacher = create :teacher
    @student = create :student
    @section = create :section, user: @teacher
    @section.add_student(@student)
    @level = create :level
  end

  test 'can be created' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    teacher_feedback = TeacherFeedback.last

    assert_equal @student.id, teacher_feedback.student_id
    assert_equal @level.id, teacher_feedback.level_id
    assert_equal @teacher.id, teacher_feedback.teacher_id
  end

  test 'retrieves no content when no feedback is available' do
    sign_in @teacher
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: @teacher.id}

    assert_response :no_content
  end

  test 'can be retrieved by teacher' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: @teacher.id}

    assert_equal COMMENT1, parsed_response['comment']
  end

  test 'retrieves feedback for correct student' do
    student2 = create :student
    @section.add_student(student2)

    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    teacher_sign_in_and_comment(@teacher, student2, @level, COMMENT2)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: @teacher.id}

    assert_response :success
    assert_equal @student.id, parsed_response['student_id']
    assert_equal COMMENT1, parsed_response['comment']
  end

  test 'retrieves feedback from correct teacher' do
    teacher2 = create :teacher
    section2 = create :section, user: teacher2
    section2.add_student(@student)

    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    sign_out @teacher

    teacher_sign_in_and_comment(teacher2, @student, @level, COMMENT2)
    sign_out teacher2

    sign_in @teacher
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: @teacher.id}
    assert_equal COMMENT1, parsed_response['comment']

    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: teacher2.id}
    assert_equal COMMENT2, parsed_response['comment']
  end

  test 'retrieves comment on requested level when teacher has given student feedback on multiple levels' do
    level2 = create :level
    level3 = create :level

    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    teacher_sign_in_and_comment(@teacher, @student, level2, COMMENT2)
    teacher_sign_in_and_comment(@teacher, @student, level3, COMMENT3)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: level2.id, teacher_id: @teacher.id}

    assert_equal COMMENT2, parsed_response['comment']
  end

  test 'retrieves the most recent comment from a teacher' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT2)
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT3)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: @teacher.id}

    assert_equal COMMENT3, parsed_response['comment']
  end

  test 'bad request when student_id not provided - get_feedback_from_teacher' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    get "#{API}/get_feedback_from_teacher", params: {level_id: @level.id, teacher_id: @teacher.id}

    assert_response :bad_request
  end

  test 'bad request when level_id not provided - get_feedback_from_teacher' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, teacher_id: @teacher.id}

    assert_response :bad_request
  end

  test 'bad request when teacher_id not provided - get_feedback_from_teacher' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id}

    assert_response :bad_request
  end

  test 'empty array when no feedback available' do
    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id}

    assert_equal [], parsed_response
  end

  test 'bad request when student_id not provided - get_feedbacks' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    get "#{API}/get_feedbacks", params: {level_id: @level.id}

    assert_response :bad_request
  end

  test 'bad request when level_id not provided - get_feedbacks' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    get "#{API}/get_feedbacks", params: {student_id: @student.id}

    assert_response :bad_request
  end

  test 'student can retrieve feedback for a level - two comments, one teacher' do
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT2)
    sign_out @teacher

    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id}

    assert_equal 1, parsed_response.count
    assert_equal COMMENT2, parsed_response[0]['comment']
  end

  test 'student can retrieve feedback for a level - three comments, two teachers' do
    teacher2 = create :teacher
    section2 = create :section, user: teacher2
    section2.add_student(@student)

    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    sign_out @teacher
    teacher_sign_in_and_comment(teacher2, @student, @level, COMMENT2)
    sign_out teacher2
    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT3)
    sign_out @teacher

    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id}

    assert_equal 2, parsed_response.count
    assert_equal COMMENT2, parsed_response[1]['comment']
    assert_equal COMMENT3, parsed_response[0]['comment']
  end

  test 'student can retrieve feedback for a level - two levels, one comment per level, one teacher' do
    level2 = create :level

    teacher_sign_in_and_comment(@teacher, @student, @level, COMMENT1)
    teacher_sign_in_and_comment(@teacher, @student, level2, COMMENT2)
    sign_out @teacher

    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id}

    assert_equal 1, JSON.parse(@response.body).count
    assert_equal COMMENT1, parsed_response[0]['comment']
  end

  test 'returns elegantly when no feedback' do
    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id}

    assert_empty parsed_response
  end

  test 'serializer returns teacher name' do
    @teacher1 = create :teacher, name: 'Test Name'
    @section1 = create :section, user: @teacher1
    @section1.add_student(@student)

    teacher_sign_in_and_comment(@teacher1, @student, @level, COMMENT1)
    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id}

    assert_equal 'Test Name', parsed_response[0]['teacher_name']
  end

  private

  def parsed_response
    JSON.parse(@response.body)
  end

  # Sign in as teacher and leave feedback for student on level.
  # Assert that the feedback request was successful
  def teacher_sign_in_and_comment(teacher, student, level, comment)
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
  end
end

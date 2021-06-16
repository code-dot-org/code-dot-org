require 'test_helper'

class Api::V1::TeacherFeedbacksControllerTest < ActionDispatch::IntegrationTest
  API = '/api/v1/teacher_feedbacks'
  COMMENT1 = 'Comment Alpha'
  COMMENT2 = 'Comment Beta'
  COMMENT3 = 'Comment Gamma'
  PERFORMANCE1 = 'performanceLevel1'
  PERFORMANCE2 = 'performanceLevel3'
  PERFORMANCE3 = 'performanceLevel4'
  REVIEW_STATE = 'keepWorking'

  self.use_transactional_test_case = true
  setup_all do
    #create student, teacher, and level and register student in teacher's section
    @teacher = create :authorized_teacher
    @not_authorized_teacher = create :teacher
    @student = create :student
    @section = create :section, user: @teacher
    @section.add_student(@student)
    @level = create :level
    @script_level = create :script_level
    @unit = @script_level.script
  end

  test 'can be created' do
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    teacher_feedback = TeacherFeedback.last

    assert_equal @student.id, teacher_feedback.student_id
    assert_equal @level.id, teacher_feedback.level_id
    assert_equal @teacher.id, teacher_feedback.teacher_id
    assert_equal @section.id, teacher_feedback.analytics_section_id
  end

  test 'retrieves no content when no feedback is available' do
    sign_in @teacher
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: @teacher.id, script_id: @unit.id}

    assert_response :no_content
  end

  test 'can be retrieved by teacher' do
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1, REVIEW_STATE)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: @teacher.id, script_id: @unit.id}

    assert_equal COMMENT1, parsed_response['comment']
    assert_equal PERFORMANCE1, parsed_response['performance']
    assert_equal REVIEW_STATE, parsed_response['review_state']
  end

  test 'retrieves feedback for correct student' do
    student2 = create :student
    @section.add_student(student2)

    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    teacher_sign_in_and_give_feedback(@teacher, student2, @script, @level, @script_level, COMMENT2, PERFORMANCE2)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: @teacher.id, script_id: @unit.id}

    assert_response :success
    assert_equal @student.id, parsed_response['student_id']
    assert_equal COMMENT1, parsed_response['comment']
    assert_equal PERFORMANCE1, parsed_response['performance']
  end

  test 'retrieves feedback from correct teacher' do
    teacher2 = create :teacher
    section2 = create :section, user: teacher2
    section2.add_student(@student)

    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    sign_out @teacher

    teacher_sign_in_and_give_feedback(teacher2, @student, @script, @level, @script_level, COMMENT2, PERFORMANCE2)
    sign_out teacher2

    sign_in @teacher
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: @teacher.id, script_id: @unit.id}
    assert_equal COMMENT1, parsed_response['comment']
    assert_equal PERFORMANCE1, parsed_response['performance']

    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: teacher2.id, script_id: @unit.id}
    assert_equal COMMENT2, parsed_response['comment']
    assert_equal PERFORMANCE2, parsed_response['performance']
  end

  test 'retrieves comment on requested level when teacher has given student feedback on multiple levels' do
    level2 = create :level
    script_level2 = create :script_level
    script2 = script_level2.script
    level3 = create :level
    script_level3 = create :script_level
    script3 = script_level3.script

    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    teacher_sign_in_and_give_feedback(@teacher, @student, script2, level2, script_level2, COMMENT2, PERFORMANCE2)
    teacher_sign_in_and_give_feedback(@teacher, @student, script3, level3, script_level3, COMMENT3, PERFORMANCE3)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: level2.id, teacher_id: @teacher.id, script_id: script2.id}

    assert_equal COMMENT2, parsed_response['comment']
    assert_equal PERFORMANCE2, parsed_response['performance']
  end

  test 'retrieves the most recent feedback from a teacher' do
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT2, PERFORMANCE2)
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT3, PERFORMANCE3)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: @teacher.id, script_id: @unit.id}

    assert_equal COMMENT3, parsed_response['comment']
    assert_equal PERFORMANCE3, parsed_response['performance']
  end

  test 'bad request when student_id not provided - get_feedback_from_teacher' do
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    get "#{API}/get_feedback_from_teacher", params: {level_id: @level.id, teacher_id: @teacher.id, script_id: @unit.id}

    assert_response :bad_request
  end

  test 'bad request when level_id not provided - get_feedback_from_teacher' do
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, teacher_id: @teacher.id, script_id: @unit.id}

    assert_response :bad_request
  end

  test 'bad request when teacher_id not provided - get_feedback_from_teacher' do
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, script_id: @unit.id}

    assert_response :bad_request
  end

  test 'bad request when script_id not provided - get_feedback_from_teacher' do
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    get "#{API}/get_feedback_from_teacher", params: {student_id: @student.id, level_id: @level.id, teacher_id: @teacher.id}

    assert_response :bad_request
  end

  test 'empty array when no feedback available' do
    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id, script_id: @unit.id}

    assert_equal [], parsed_response
  end

  test 'count is 0 when no feedback available' do
    sign_in @student
    get "#{API}/count"

    assert_equal "0", response.body
  end

  test 'count is accurate when feedback is available' do
    sign_in @student
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    sign_out @teacher

    sign_in @student
    get "#{API}/count"
    assert_equal "1", response.body

    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT2, PERFORMANCE2)
    sign_out @teacher

    sign_in @student
    get "#{API}/count"

    assert_equal "2", response.body
  end

  test 'count does not include already seen feedback' do
    sign_in @student
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    sign_out @teacher

    sign_in @student
    get "#{API}/count"

    assert_equal "1", response.body

    TeacherFeedback.last.update_attribute(
      :seen_on_feedback_page_at,
      DateTime.now
    )

    get "#{API}/count"
    assert_equal "0", response.body
  end

  test 'count does not include feedback from a not authorized teacher' do
    teacher_sign_in_and_give_feedback(@not_authorized_teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    sign_out @not_authorized_teacher

    sign_in @student
    get "#{API}/count"

    assert_equal "0", response.body
  end

  test 'bad request when student_id not provided - get_feedbacks' do
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    get "#{API}/get_feedbacks", params: {level_id: @level.id, script_id: @unit.id}

    assert_response :bad_request
  end

  test 'bad request when level_id not provided - get_feedbacks' do
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    get "#{API}/get_feedbacks", params: {student_id: @student.id, script_id: @unit.id}

    assert_response :bad_request
  end

  test 'bad request when script_id not provided - get_feedbacks' do
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id}

    assert_response :bad_request
  end

  test 'student can retrieve feedback for a level - two comments, one teacher' do
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT2, PERFORMANCE2)
    sign_out @teacher

    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id, script_id: @unit.id}

    assert_equal 1, parsed_response.count
    assert_equal COMMENT2, parsed_response[0]['comment']
    assert_equal PERFORMANCE2, parsed_response[0]['performance']
  end

  test 'student can retrieve feedback for a level - three comments, two teachers' do
    teacher2 = create :teacher
    section2 = create :section, user: teacher2
    section2.add_student(@student)

    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    sign_out @teacher
    teacher_sign_in_and_give_feedback(teacher2, @student, @script, @level, @script_level, COMMENT2, PERFORMANCE2)
    sign_out teacher2
    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT3, PERFORMANCE3)
    sign_out @teacher

    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id, script_id: @unit.id}

    assert_equal 2, parsed_response.count
    assert_equal COMMENT2, parsed_response[1]['comment']
    assert_equal PERFORMANCE2, parsed_response[1]['performance']
    assert_equal COMMENT3, parsed_response[0]['comment']
    assert_equal PERFORMANCE3, parsed_response[0]['performance']
  end

  test 'student can retrieve feedback for a level - two levels, one comment per level, one teacher' do
    level2 = create :level
    script_level2 = create :script_level
    script2 = script_level2.script

    teacher_sign_in_and_give_feedback(@teacher, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    teacher_sign_in_and_give_feedback(@teacher, @student, script2, level2, script_level2, COMMENT2, PERFORMANCE2)
    sign_out @teacher

    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id, script_id: @unit.id}

    assert_equal 1, JSON.parse(@response.body).count
    assert_equal COMMENT1, parsed_response[0]['comment']
    assert_equal PERFORMANCE1, parsed_response[0]['performance']
  end

  # tests for the bug when feedback leaks between scripts with the same levels
  test 'when a level is part of more than one script, student receives feedback for the level feedback was given' do
    level = create :level
    script_level = create :script_level
    script = script_level.script
    script_level2 = create :script_level
    script2 = script_level2.script

    teacher_sign_in_and_give_feedback(@teacher, @student, script, level, script_level, COMMENT1, PERFORMANCE1)
    teacher_sign_in_and_give_feedback(@teacher, @student, script2, level, script_level2, COMMENT2, PERFORMANCE2)
    sign_out @teacher

    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: level.id, script_id: script.id}

    assert_equal 1, JSON.parse(@response.body).count
    assert_equal COMMENT1, parsed_response[0]['comment']
    assert_equal PERFORMANCE1, parsed_response[0]['performance']
  end

  test 'returns elegantly when no feedback' do
    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id, script_id: @unit.id}

    assert_empty parsed_response
  end

  test 'serializer returns teacher name' do
    @teacher1 = create :teacher, name: 'Test Name'
    @section1 = create :section, user: @teacher1
    @section1.add_student(@student)

    teacher_sign_in_and_give_feedback(@teacher1, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id, script_id: @unit.id}

    assert_equal 'Test Name', parsed_response[0]['teacher_name']
  end

  test 'serializer returns student_last_updated and student_updated_since_feedback' do
    @teacher1 = create :teacher, name: 'Test Name'
    @section1 = create :section, user: @teacher1
    @section1.add_student(@student)
    user_level = create :user_level, user: @student, level: @level, script: @script
    user_level.reload # needed to retrieve the correct updated_at date

    teacher_sign_in_and_give_feedback(@teacher1, @student, @script, @level, @script_level, COMMENT1, PERFORMANCE1)
    sign_in @student
    get "#{API}/get_feedbacks", params: {student_id: @student.id, level_id: @level.id, script_id: @unit.id}

    assert_equal user_level.updated_at, parsed_response[0]['student_last_updated']
    assert_equal false, parsed_response[0]['student_updated_since_feedback']
  end

  test 'increment_visit_count returns no_content on successful save' do
    TeacherFeedback.any_instance.stubs(:increment_visit_count).returns(true)
    feedback = create :teacher_feedback

    sign_in feedback.student
    post "#{API}/#{feedback.id}/increment_visit_count"
    assert_response :no_content
  end

  test 'increment_visit_count returns unprocessable_entity on failed save' do
    TeacherFeedback.any_instance.stubs(:increment_visit_count).returns(false)
    feedback = create :teacher_feedback

    sign_in feedback.student
    post "#{API}/#{feedback.id}/increment_visit_count"
    assert_response :unprocessable_entity
  end

  private

  def parsed_response
    JSON.parse(@response.body)
  end

  # Sign in as teacher and leave feedback for student on level.
  # Assert that the feedback request was successful
  # Note that the section that a piece of teacher feedback is explicitly associated with via section ID
  # is not (as of Feb. 2021) used in our application (we're only logging section ID for analytics purposes for now),
  # so the section created during setup_all is provided as a default.
  def teacher_sign_in_and_give_feedback(teacher, student, script, level, script_level, comment, performance, review_state = nil, section=@section)
    sign_in teacher
    params = {
      student_id: student.id,
      script_id: script.id,
      level_id:  level.id,
      script_level_id: script_level.id,
      comment: comment,
      performance: performance,
      review_state: review_state,
      analytics_section_id: section.id
    }

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params}
      assert_response :success
    end
  end
end

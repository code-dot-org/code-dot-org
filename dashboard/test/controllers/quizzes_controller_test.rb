require 'test_helper'

class QuizzesControllerTest < ActionController::TestCase
  setup do
    @teacher = create(:teacher)
    @teacher.permission = UserPermission::AUTHORIZED_TEACHER
    @section = create(:section, user: @teacher, login_type: 'word')
    @student = create(:student)
    create(:follower, section: @section, student_user: @student)

    @script = create(:script)
    lesson_group = create(:lesson_group, script: @script)
    @lesson = create(:lesson, script: @script, lesson_group: lesson_group)
    @quiz = create(:quiz, properties: {title: 'Chapter 1 quiz'})
    create(:script_level, script: @script, lesson: @lesson, levels: [@quiz])

    @question_1 = create(:multiple_choice_question)
    @question_2 = create(:multiple_choice_question)
    create(:quiz_level_question, level: @quiz, quiz_question: @question_1, position: 1)
    create(:quiz_level_question, level: @quiz, quiz_question: @question_2, position: 2)
  end

  test 'logged out cannot get section responses' do
    get :section_responses, params: {section_id: @section.id, script_id: @script.id}
    assert_redirected_to_sign_in
  end

  test 'non-verified teacher cannot get section responses' do
    non_verified_teacher = create(:teacher)
    section = create(:section, user: non_verified_teacher, login_type: 'word')

    sign_in non_verified_teacher
    get :section_responses, params: {section_id: section.id, script_id: @script.id}
    assert_response :forbidden
  end

  test 'a teacher cannot get another teacher\'s section responses' do
    other_teacher = create(:teacher)
    other_teacher.permission = UserPermission::AUTHORIZED_TEACHER

    sign_in other_teacher
    get :section_responses, params: {section_id: @section.id, script_id: @script.id}
    assert_response :forbidden
  end

  test 'verified teacher gets question metadata and an empty response for a student with no attempts' do
    sign_in @teacher
    get :section_responses, params: {section_id: @section.id, script_id: @script.id}
    assert_response :success

    body = JSON.parse(response.body)
    quiz_data = body[@quiz.id.to_s]
    assert_equal @quiz.id.to_s, quiz_data['id']
    assert_equal @lesson.localized_title, quiz_data['name']
    assert_equal 2, quiz_data['questions'].length
    assert_equal({}, quiz_data['responses_by_student'])
  end

  test 'a quiz with no multiple choice questions is omitted entirely' do
    empty_quiz = create(:quiz)
    create(:script_level, script: @script, lesson: @lesson, levels: [empty_quiz])

    sign_in @teacher
    get :section_responses, params: {section_id: @section.id, script_id: @script.id}
    assert_response :success

    body = JSON.parse(response.body)
    refute body.key?(empty_quiz.id.to_s)
  end

  test 'an in-progress attempt reports every question as unsubmitted' do
    create(:quiz_attempt, user: @student, level: @quiz, script: @script, attempt_number: 1)

    sign_in @teacher
    get :section_responses, params: {section_id: @section.id, script_id: @script.id}
    assert_response :success

    student_data = JSON.parse(response.body)[@quiz.id.to_s]['responses_by_student'][@student.id.to_s]
    %w(most_recent highest_scoring).each do |mode|
      assert_equal false, student_data[mode]['submitted']
      assert_equal 0, student_data[mode]['multi_correct']
      assert_equal(['unsubmitted', 'unsubmitted'], student_data[mode]['level_results'].map {|r| r['status']})
    end
  end

  test 'the most recent and highest scoring attempts can differ' do
    correct_id = @question_1.question['correct_choice_id']
    incorrect_id = (@question_1.question['choices'].map {|c| c['id']} - [correct_id]).first

    earlier_attempt = create(:quiz_attempt, user: @student, level: @quiz, script: @script, attempt_number: 1, submitted_at: 1.hour.ago, score: 2, max_score: 2)
    create(:quiz_question_response, quiz_attempt: earlier_attempt, quiz_question: @question_1, response_data: {selectedChoiceId: correct_id}, score: 1, max_score: 1, grading_status: 'auto_graded')
    create(:quiz_question_response, quiz_attempt: earlier_attempt, quiz_question: @question_2, response_data: {selectedChoiceId: @question_2.question['correct_choice_id']}, score: 1, max_score: 1, grading_status: 'auto_graded')

    later_attempt = create(:quiz_attempt, user: @student, level: @quiz, script: @script, attempt_number: 2, submitted_at: 1.minute.ago, score: 0, max_score: 2)
    create(:quiz_question_response, quiz_attempt: later_attempt, quiz_question: @question_1, response_data: {selectedChoiceId: incorrect_id}, score: 0, max_score: 1, grading_status: 'auto_graded')

    sign_in @teacher
    get :section_responses, params: {section_id: @section.id, script_id: @script.id}
    assert_response :success

    student_data = JSON.parse(response.body)[@quiz.id.to_s]['responses_by_student'][@student.id.to_s]
    assert_equal 0, student_data['most_recent']['multi_correct']
    assert_equal 2, student_data['highest_scoring']['multi_correct']
  end
end

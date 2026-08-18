require 'test_helper'

class QuizAttemptsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @student = create(:student)
    @quiz = create(:quiz)
    @question = create(:multiple_choice_question)
    create(:quiz_level_question, level: @quiz, quiz_question: @question)
    @attempt = create(:quiz_attempt, user: @student, level: @quiz)
  end

  test "update scores only auto-graded responses for questions on the quiz" do
    create(
      :quiz_question_response,
      quiz_attempt: @attempt,
      quiz_question: @question,
      score: 1,
      max_score: 1,
      grading_status: 'auto_graded'
    )

    off_quiz_question = create(:multiple_choice_question)
    create(
      :quiz_question_response,
      quiz_attempt: @attempt,
      quiz_question: off_quiz_question,
      score: 1,
      max_score: 1,
      grading_status: 'auto_graded'
    )

    sign_in @student
    put :update, params: {id: @attempt.id}

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal 1, body['score']
    assert_equal 1, body['maxScore']
    assert_equal 1, @attempt.reload.score
    assert_equal 1, @attempt.max_score
  end

  test "create redirects to sign in when not signed in" do
    post :create, params: {levelId: @quiz.id, scriptId: @attempt.script_id}
    assert_redirected_to_sign_in
  end

  test "create starts an attempt when the level is a Quiz in the given script" do
    script = create_script_with_quiz(@quiz)
    sign_in @student

    assert_difference 'QuizAttempt.count', 1 do
      post :create, params: {levelId: @quiz.id, scriptId: script.id}
    end

    assert_response :created
    body = JSON.parse(response.body)
    attempt = QuizAttempt.find(body['id'])
    assert_equal @student.id, attempt.user_id
    assert_equal @quiz.id, attempt.level_id
    assert_equal script.id, attempt.script_id
    assert_equal 1, attempt.attempt_number
  end

  test "create resumes the existing attempt instead of making a second one" do
    script = create_script_with_quiz(@quiz)
    sign_in @student

    post :create, params: {levelId: @quiz.id, scriptId: script.id}
    assert_response :created
    first_id = JSON.parse(response.body)['id']

    assert_no_difference 'QuizAttempt.count' do
      post :create, params: {levelId: @quiz.id, scriptId: script.id}
    end

    assert_response :created
    assert_equal first_id, JSON.parse(response.body)['id']
  end

  test "create rejects a level that is not a Quiz" do
    script = create(:script)
    level = create(:level)
    lesson = create(:lesson, script: script)
    create(:script_level, script: script, lesson: lesson, levels: [level])
    sign_in @student

    assert_no_difference 'QuizAttempt.count' do
      post :create, params: {levelId: level.id, scriptId: script.id}
    end

    assert_response :bad_request
  end

  test "create rejects a Quiz that is not in the given script" do
    other_script = create(:script)
    sign_in @student

    assert_no_difference 'QuizAttempt.count' do
      post :create, params: {levelId: @quiz.id, scriptId: other_script.id}
    end

    assert_response :bad_request
  end

  test "create does not let a second scriptId mint another attempt at the same quiz" do
    script = create_script_with_quiz(@quiz)
    sign_in @student

    post :create, params: {levelId: @quiz.id, scriptId: script.id}
    assert_response :created

    other_script = create(:script)
    assert_no_difference 'QuizAttempt.count' do
      post :create, params: {levelId: @quiz.id, scriptId: other_script.id}
    end

    assert_response :bad_request
  end

  private def create_script_with_quiz(quiz)
    script = create(:script)
    lesson = create(:lesson, script: script)
    create(:script_level, script: script, lesson: lesson, levels: [quiz])
    script
  end
end

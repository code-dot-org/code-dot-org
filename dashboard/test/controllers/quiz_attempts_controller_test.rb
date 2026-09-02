require 'test_helper'

class QuizAttemptsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @student = create(:student)
    @quiz = create(:quiz)
    @question = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: @question)
    @attempt = create(:quiz_attempt, user: @student, level: @quiz)
  end

  test "index returns null when the user has no attempt yet" do
    other_quiz = create(:quiz)
    sign_in @student

    get :index, params: {levelId: other_quiz.id, unitId: @attempt.unit_id}

    assert_response :success
    assert_nil JSON.parse(response.body)
  end

  test "index returns the latest attempt without creating one" do
    sign_in @student

    assert_no_difference 'QuizAttempt.count' do
      get :index, params: {levelId: @quiz.id, unitId: @attempt.unit_id}
    end

    assert_response :success
    assert_equal @attempt.id, JSON.parse(response.body)['id']
  end

  test "index is forbidden when viewing another user's attempt without a teacher relationship" do
    other_student = create(:student)
    sign_in other_student

    get :index, params: {levelId: @quiz.id, unitId: @attempt.unit_id, userId: @student.id}

    assert_response :forbidden
  end

  test "index allows a teacher to view their student's attempt" do
    teacher = create(:teacher)
    create(:follower, student_user: @student, user: teacher)
    sign_in teacher

    get :index, params: {levelId: @quiz.id, unitId: @attempt.unit_id, userId: @student.id}

    assert_response :success
    assert_equal @attempt.id, JSON.parse(response.body)['id']
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
    post :create, params: {levelId: @quiz.id, unitId: @attempt.unit_id}
    assert_redirected_to_sign_in
  end

  test "create starts an attempt when the level is a Quiz in the given unit" do
    unit = create_unit_with_quiz(@quiz)
    sign_in @student

    assert_difference 'QuizAttempt.count', 1 do
      post :create, params: {levelId: @quiz.id, unitId: unit.id}
    end

    assert_response :created
    body = JSON.parse(response.body)
    attempt = QuizAttempt.find(body['id'])
    assert_equal @student.id, attempt.user_id
    assert_equal @quiz.id, attempt.level_id
    assert_equal unit.id, attempt.unit_id
    assert_equal 1, attempt.attempt_number
  end

  test "create resumes the existing attempt instead of making a second one" do
    unit = create_unit_with_quiz(@quiz)
    sign_in @student

    post :create, params: {levelId: @quiz.id, unitId: unit.id}
    assert_response :created
    first_id = JSON.parse(response.body)['id']

    assert_no_difference 'QuizAttempt.count' do
      post :create, params: {levelId: @quiz.id, unitId: unit.id}
    end

    assert_response :ok
    assert_equal first_id, JSON.parse(response.body)['id']
  end

  test "create retries and resumes when a concurrent request wins the unique index" do
    unit = create_unit_with_quiz(@quiz)
    sign_in @student

    original_create = QuizAttempt.method(:create!)
    QuizAttempt.stubs(:create!) do |*args, **kwargs|
      original_create.call(*args, **kwargs)
      raise ActiveRecord::RecordNotUnique, "Duplicate entry 'x' for key 'index_quiz_attempts_on_user_level_unit_attempt'"
    end
    assert_difference 'QuizAttempt.count', 1 do
      post :create, params: {levelId: @quiz.id, unitId: unit.id}
    end

    assert_response :ok
    body = JSON.parse(response.body)
    attempt = QuizAttempt.find(body['id'])
    assert_equal @student.id, attempt.user_id
    assert_equal @quiz.id, attempt.level_id
    assert_equal unit.id, attempt.unit_id
    assert_equal 1, attempt.attempt_number
  end

  test "create rejects a level that is not a Quiz" do
    unit = create(:unit)
    level = create(:level)
    lesson = create(:lesson, script: unit)
    create(:script_level, script: unit, lesson: lesson, levels: [level])
    sign_in @student

    assert_no_difference 'QuizAttempt.count' do
      post :create, params: {levelId: level.id, unitId: unit.id}
    end

    assert_response :bad_request
  end

  test "create rejects a Quiz that is not in the given unit" do
    other_unit = create(:unit)
    sign_in @student

    assert_no_difference 'QuizAttempt.count' do
      post :create, params: {levelId: @quiz.id, unitId: other_unit.id}
    end

    assert_response :bad_request
  end

  test "create does not let a second unitId mint another attempt at the same quiz" do
    unit = create_unit_with_quiz(@quiz)
    sign_in @student

    post :create, params: {levelId: @quiz.id, unitId: unit.id}
    assert_response :created

    other_unit = create(:unit)
    assert_no_difference 'QuizAttempt.count' do
      post :create, params: {levelId: @quiz.id, unitId: other_unit.id}
    end

    assert_response :bad_request
  end

  private def create_unit_with_quiz(quiz)
    unit = create(:unit)
    lesson = create(:lesson, script: unit)
    create(:script_level, script: unit, lesson: lesson, levels: [quiz])
    unit
  end
end

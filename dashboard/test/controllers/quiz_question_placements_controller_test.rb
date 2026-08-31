require 'test_helper'

class QuizQuestionPlacementsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create(:levelbuilder)
    @teacher = create(:teacher)
    @quiz = create(:quiz)
    @question = create(:multiple_choice_question)
    @placement = create(:quiz_question_placement, level: @quiz, quiz_question: @question, page: 1, position: 1)
    sign_in @levelbuilder
  end

  # --- authorization / guards, shared by every action ---

  test "create redirects to sign in when not signed in" do
    sign_out @levelbuilder
    post :create, params: {level_id: @quiz.id}
    assert_redirected_to_sign_in
  end

  test "create is forbidden for a non-levelbuilder" do
    sign_in @teacher
    post :create, params: {level_id: @quiz.id}
    assert_response :forbidden
  end

  test "create 404s on a level that is not a Quiz" do
    level = create(:level)
    post :create, params: {level_id: level.id}
    assert_response :not_found
  end

  # --- create ---

  test "create makes a new bank question and attaches it as the next position" do
    create(:quiz_question_placement, level: @quiz, quiz_question: create(:multiple_choice_question), page: 1, position: 2)

    assert_difference '@quiz.placements.count', 1 do
      post :create, params: {
        level_id: @quiz.id,
        questionName: 'New question',
        stem: 'What is 2 + 2?',
        choices: [{id: 'a', text: '3'}, {id: 'b', text: '4'}],
        correctChoiceId: 'b',
        page: 1
      }
    end

    assert_response :created
    body = JSON.parse(response.body)
    question = MultipleChoiceQuestion.find(body['id'])
    assert_equal 'New question', question.name
    assert_equal 'b', question.content['correct_choice_id']
    placement = @quiz.placements.find_by!(quiz_question_id: question.id)
    assert_equal 3, placement.position
  end

  test "create returns bad_request when required fields are missing" do
    assert_no_difference 'QuizQuestion.count' do
      post :create, params: {level_id: @quiz.id, questionName: '', stem: '', choices: [], correctChoiceId: ''}
    end

    assert_response :bad_request
    assert JSON.parse(response.body)['error'].present?
  end

  test "create rolls back the question entirely when standard assignment fails" do
    assert_no_difference 'QuizQuestion.count' do
      post :create, params: {
        level_id: @quiz.id,
        questionName: 'Orphan risk',
        stem: 'What is 2 + 2?',
        choices: [{id: 'a', text: '3'}, {id: 'b', text: '4'}],
        correctChoiceId: 'b',
        standards: [{frameworkShortcode: 'not-a-real-framework', shortcode: 'not-a-real-standard'}]
      }
    end

    assert_response :bad_request
    refute QuizQuestion.exists?(name: 'Orphan risk')
  end

  # --- attach / detach / destroy: three different removal semantics ---

  test "attach is idempotent - attaching an already-attached question does not duplicate the placement" do
    assert_no_difference '@quiz.placements.count' do
      post :attach, params: {level_id: @quiz.id, id: @question.id}
    end
    assert_response :created
  end

  test "attach adds an existing bank question without creating a new QuizQuestion row" do
    other_question = create(:multiple_choice_question)

    assert_no_difference 'QuizQuestion.count' do
      post :attach, params: {level_id: @quiz.id, id: other_question.id}
    end

    assert_response :created
    assert @quiz.placements.exists?(quiz_question_id: other_question.id)
  end

  test "detach removes the placement but leaves the question itself intact" do
    delete :detach, params: {level_id: @quiz.id, id: @question.id}

    assert_response :no_content
    refute @quiz.placements.exists?(quiz_question_id: @question.id)
    assert QuizQuestion.exists?(@question.id)
  end

  test "destroy removes the question outright when it's not attached to any other quiz" do
    delete :destroy, params: {level_id: @quiz.id, id: @question.id}

    assert_response :success
    assert_equal true, JSON.parse(response.body)['destroyed']
    refute QuizQuestion.exists?(@question.id)
  end

  test "destroy falls back to a plain detach when the question is still attached elsewhere" do
    other_quiz = create(:quiz)
    create(:quiz_question_placement, level: other_quiz, quiz_question: @question, page: 1, position: 1)

    delete :destroy, params: {level_id: @quiz.id, id: @question.id}

    assert_response :success
    assert_equal false, JSON.parse(response.body)['destroyed']
    assert QuizQuestion.exists?(@question.id)
    refute @quiz.placements.exists?(quiz_question_id: @question.id)
    assert other_quiz.placements.exists?(quiz_question_id: @question.id)
  end

  # Regression tests for a Copilot review finding: the deletion check only
  # looked at other placements, not QuizQuestionResponse or forked
  # questions' fork_parent_id - both are also FKs to this row, so destroy!
  # would raise (a 500) after the placement was already gone, rather than
  # falling back to a plain detach the way an other-quiz placement does.
  test "destroy falls back to a plain detach when the question has a QuizQuestionResponse" do
    attempt = create(:quiz_attempt, level: @quiz)
    create(:quiz_question_response, quiz_attempt: attempt, quiz_question: @question)

    delete :destroy, params: {level_id: @quiz.id, id: @question.id}

    assert_response :success
    assert_equal false, JSON.parse(response.body)['destroyed']
    assert QuizQuestion.exists?(@question.id)
    refute @quiz.placements.exists?(quiz_question_id: @question.id)
  end

  test "destroy falls back to a plain detach when another question was forked from this one" do
    create(:multiple_choice_question, fork_parent: @question)

    delete :destroy, params: {level_id: @quiz.id, id: @question.id}

    assert_response :success
    assert_equal false, JSON.parse(response.body)['destroyed']
    assert QuizQuestion.exists?(@question.id)
    refute @quiz.placements.exists?(quiz_question_id: @question.id)
  end
end

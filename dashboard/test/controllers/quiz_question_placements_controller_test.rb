require 'test_helper'

class QuizQuestionPlacementsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)
    FileUtils.stubs(:mkdir_p)
    File.stubs(:write)
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
        type: 'MultipleChoiceQuestion',
        questionName: 'New question',
        questionTitle: 'What is 2 + 2?',
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
    refute question.content.key?('description')
    placement = @quiz.placements.find_by!(quiz_question_id: question.id)
    assert_equal 3, placement.position
  end

  test "create makes a multiple select question with its correct choice ids" do
    post :create, params: {
      level_id: @quiz.id,
      type: 'MultipleSelectQuestion',
      questionName: 'Evens',
      questionTitle: 'Which of these are even?',
      choices: [{id: 'a', text: '2'}, {id: 'b', text: '3'}, {id: 'c', text: '4'}],
      correctChoiceIds: ['a', 'c'],
      page: 1
    }

    assert_response :created
    body = JSON.parse(response.body)
    assert_equal ['a', 'c'], body['correctChoiceIds']
    question = MultipleSelectQuestion.find(body['id'])
    assert_equal ['a', 'c'], question.content['correct_choice_ids']
  end

  test "create makes a match question with its pairs" do
    pairs = [
      {id: 'p1', items: [{id: 'a', text: '1 + 1'}, {id: 'x', text: '2'}]},
      {id: 'p2', items: [{id: 'b', text: '2 + 1'}, {id: 'y', text: '3'}]},
    ]
    post :create, as: :json, params: {
      level_id: @quiz.id,
      type: 'MatchQuestion',
      questionName: 'Sums',
      questionTitle: 'Match each expression to its value.',
      pairs: pairs,
      page: 1
    }

    assert_response :created
    body = JSON.parse(response.body)
    assert_equal pairs.map(&:deep_stringify_keys), body['pairs']
    question = MatchQuestion.find(body['id'])
    assert_equal pairs.map(&:deep_stringify_keys), question.content['pairs']
  end

  test "create returns bad_request when required fields are missing" do
    assert_no_difference 'QuizQuestion.count' do
      post :create, params: {level_id: @quiz.id, type: 'MultipleChoiceQuestion', questionName: '', questionTitle: '', choices: [], correctChoiceId: ''}
    end

    assert_response :bad_request
    assert JSON.parse(response.body)['error'].present?
  end

  test "create rolls back the question entirely when standard assignment fails" do
    assert_no_difference 'QuizQuestion.count' do
      post :create, params: {
        level_id: @quiz.id,
        type: 'MultipleChoiceQuestion',
        questionName: 'Orphan risk',
        questionTitle: 'What is 2 + 2?',
        choices: [{id: 'a', text: '3'}, {id: 'b', text: '4'}],
        correctChoiceId: 'b',
        standards: [{frameworkShortcode: 'not-a-real-framework', shortcode: 'not-a-real-standard'}]
      }
    end

    assert_response :bad_request
    refute QuizQuestion.exists?(name: 'Orphan risk')
  end

  test "create makes a FreeResponseQuestion" do
    post :create, params: {
      level_id: @quiz.id,
      type: 'FreeResponseQuestion',
      questionName: 'Reflection',
      questionTitle: 'Give one example of an abstraction.',
      description: 'A function counts.'
    }

    assert_response :created
    body = JSON.parse(response.body)
    question = FreeResponseQuestion.find(body['id'])
    assert_equal 'Give one example of an abstraction.', question.content['question_title']
    assert_equal 'A function counts.', body['description']
    assert @quiz.placements.exists?(quiz_question_id: question.id)
  end

  test "create returns bad_request when type is missing" do
    assert_no_difference 'QuizQuestion.count' do
      post :create, params: {
        level_id: @quiz.id,
        questionName: 'No type',
        questionTitle: 'What is 2 + 2?',
        choices: [{id: 'a', text: '3'}, {id: 'b', text: '4'}],
        correctChoiceId: 'b'
      }
    end

    assert_response :bad_request
  end

  test "create returns bad_request for a type not in QuizQuestion::TYPES" do
    assert_no_difference 'QuizQuestion.count' do
      post :create, params: {level_id: @quiz.id, type: 'QuizQuestion', questionName: 'x', questionTitle: 'x'}
    end

    assert_response :bad_request
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

  test "attach accepts a FreeResponseQuestion" do
    other_question = create(:free_response_question)

    post :attach, params: {level_id: @quiz.id, id: other_question.id}

    assert_response :created
    assert @quiz.placements.exists?(quiz_question_id: other_question.id)
  end

  test "attach returns bad_request for a question type outside QuizQuestion::TYPES" do
    base_question = create(:quiz_question)

    assert_no_difference 'QuizQuestionPlacement.count' do
      post :attach, params: {level_id: @quiz.id, id: base_question.id}
    end

    assert_response :bad_request
  end

  test "reorder is forbidden for a non-levelbuilder" do
    sign_in @teacher
    put :reorder, as: :json, params: {level_id: @quiz.id, placements: []}
    assert_response :forbidden
  end

  test "reorder renumbers pages from 1 and positions from 1 within each page, in the order given" do
    question2 = create(:multiple_choice_question)
    question3 = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: question2, page: 1, position: 2)
    create(:quiz_question_placement, level: @quiz, quiz_question: question3, page: 2, position: 3)

    put :reorder, as: :json, params: {
      level_id: @quiz.id,
      placements: [
        {quizQuestionId: question3.id, page: 4, position: 1},
        {quizQuestionId: @question.id, page: 7, position: 9},
        {quizQuestionId: question2.id, page: 4, position: 5},
      ]
    }

    assert_response :success
    expected = [
      {'quizQuestionId' => question3.id, 'page' => 1, 'position' => 1},
      {'quizQuestionId' => question2.id, 'page' => 1, 'position' => 2},
      {'quizQuestionId' => @question.id, 'page' => 2, 'position' => 1},
    ]
    assert_equal expected, JSON.parse(response.body)
    assert_equal [[question3.id, 1, 1], [question2.id, 1, 2], [@question.id, 2, 1]],
      (@quiz.placements.reload.map {|p| [p.quiz_question_id, p.page, p.position]})
  end

  test "reorder writes the quiz's .level file once" do
    question2 = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: question2, page: 1, position: 2)
    Services::LevelFiles.expects(:write_custom_level_file).once

    put :reorder, as: :json, params: {
      level_id: @quiz.id,
      placements: [
        {quizQuestionId: question2.id, page: 1, position: 1},
        {quizQuestionId: @question.id, page: 1, position: 2},
      ]
    }

    assert_response :success
  end

  test "reorder returns bad_request and changes nothing when the questions differ from the quiz's" do
    other_question = create(:multiple_choice_question)

    put :reorder, as: :json, params: {
      level_id: @quiz.id,
      placements: [
        {quizQuestionId: @question.id, page: 2, position: 1},
        {quizQuestionId: other_question.id, page: 1, position: 1},
      ]
    }

    assert_response :bad_request
    assert_equal [1, 1], [@placement.reload.page, @placement.position]
    refute QuizQuestionPlacement.exists?(level: @quiz, quiz_question: other_question)
  end

  test "reorder returns bad_request when a field is not an integer" do
    put :reorder, as: :json, params: {
      level_id: @quiz.id,
      placements: [{quizQuestionId: @question.id, page: 'two', position: 1}]
    }

    assert_response :bad_request
    assert_equal 1, @placement.reload.page
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

  # Response FK would 500 if we destroy! after detaching.
  test "destroy falls back to a plain detach when the question has a QuizQuestionResponse" do
    attempt = create(:quiz_attempt, level: @quiz)
    create(:quiz_question_response, quiz_attempt: attempt, quiz_question: @question)

    delete :destroy, params: {level_id: @quiz.id, id: @question.id}

    assert_response :success
    assert_equal false, JSON.parse(response.body)['destroyed']
    assert QuizQuestion.exists?(@question.id)
    refute @quiz.placements.exists?(quiz_question_id: @question.id)
  end

  # Forks don't block delete; fork_parent_id is left dangling.
  test "destroy deletes the question even when another question was forked from it" do
    fork = create(:multiple_choice_question, fork_parent: @question)

    delete :destroy, params: {level_id: @quiz.id, id: @question.id}

    assert_response :success
    assert_equal true, JSON.parse(response.body)['destroyed']
    refute QuizQuestion.exists?(@question.id)
    refute @quiz.placements.exists?(quiz_question_id: @question.id)
    fork.reload
    assert QuizQuestion.exists?(fork.id)
    assert_equal @question.id, fork.fork_parent_id
    assert_nil fork.fork_parent
  end
end

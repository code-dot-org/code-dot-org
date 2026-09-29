require 'test_helper'

class QuizzesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create(:levelbuilder)
    @teacher = create(:teacher)
    @quiz = create(:quiz)
    sign_in @levelbuilder
  end

  test "show redirects to sign in when not signed in" do
    sign_out @levelbuilder
    get :show, params: {level_id: @quiz.id}
    assert_redirected_to_sign_in
  end

  test "show is forbidden for a non-levelbuilder" do
    sign_in @teacher
    get :show, params: {level_id: @quiz.id}
    assert_response :forbidden
  end

  test "show 404s on a level that is not a Quiz" do
    level = create(:level)
    get :show, params: {level_id: level.id}
    assert_response :not_found
  end

  test "show returns the quiz's configuration fields" do
    @quiz.update!(display_name: 'Unit 3 Check', purpose: 'practice', time_limit_minutes: nil)

    get :show, params: {level_id: @quiz.id}

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal 'Unit 3 Check', body['displayName']
    assert_equal 'practice', body['purpose']
    assert_nil body['timeLimitMinutes']
    assert_equal [], body['questions']
  end

  test "show returns placed questions in placement order with correct answers, explanation, standards, and page" do
    standard = create(:standard)
    # Created last-to-first, then placed first-to-last, so the response
    # order matches neither insertion nor id order - only (page, position).
    third = create(:multiple_choice_question, name: 'Page 2')
    second = create(:multiple_choice_question, name: 'Page 1, position 2')
    first = create(
      :multiple_choice_question,
      name: 'Page 1, position 1',
      content: {
        stem: 'Pick B',
        choices: [{id: 'a', text: 'A'}, {id: 'b', text: 'B'}],
        correct_choice_id: 'b'
      },
      explanation: 'Because B.'
    )
    first.standards = [standard]

    create(:quiz_question_placement, level: @quiz, quiz_question: third, page: 2, position: 1)
    create(:quiz_question_placement, level: @quiz, quiz_question: second, page: 1, position: 2)
    create(:quiz_question_placement, level: @quiz, quiz_question: first, page: 1, position: 1)

    get :show, params: {level_id: @quiz.id}

    assert_response :success
    questions = JSON.parse(response.body)['questions']
    assert_equal [first.id, second.id, third.id], (questions.map {|q| q['id']})

    first_json = questions.first
    assert_equal 'b', first_json['correctChoiceId']
    assert_equal 'Because B.', first_json['explanation']
    assert_equal 1, first_json['page']
    assert_equal [standard.shortcode], (first_json['standards'].map {|s| s['shortcode']})
    assert_equal 2, questions.last['page']
  end

  test "show flags a question used in a published unit" do
    question = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: question, page: 1, position: 1)
    QuizQuestion.stubs(:published_unit_usage).returns(question.id => true)

    get :show, params: {level_id: @quiz.id}

    assert_response :success
    assert_equal true, JSON.parse(response.body)['questions'].first['usedInPublishedUnit']
  end

  test "show flags a question placed in another quiz, but not one placed only in this quiz" do
    other_quiz = create(:quiz)
    shared_question = create(:multiple_choice_question)
    solo_question = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: shared_question, page: 1, position: 1)
    create(:quiz_question_placement, level: @quiz, quiz_question: solo_question, page: 1, position: 2)
    create(:quiz_question_placement, level: other_quiz, quiz_question: shared_question, page: 1, position: 1)

    get :show, params: {level_id: @quiz.id}

    assert_response :success
    questions = JSON.parse(response.body)['questions'].index_by {|q| q['id']}
    assert_equal true, questions[shared_question.id]['attachedToOtherQuizzes']
    assert_equal false, questions[solo_question.id]['attachedToOtherQuizzes']
  end

  test "update redirects to sign in when not signed in" do
    sign_out @levelbuilder
    put :update, params: {level_id: @quiz.id, displayName: 'x'}
    assert_redirected_to_sign_in
  end

  test "update is forbidden for a non-levelbuilder" do
    sign_in @teacher
    put :update, params: {level_id: @quiz.id, displayName: 'x'}
    assert_response :forbidden
  end

  test "update 404s on a level that is not a Quiz" do
    level = create(:level)
    put :update, params: {level_id: level.id, displayName: 'x'}
    assert_response :not_found
  end

  test "update sets the Quiz's own configuration fields" do
    put :update, params: {
      level_id: @quiz.id,
      displayName: 'Unit 3 Check for Understanding',
      customIntroText: 'You have 20 minutes.',
      timeLimitMinutes: 20,
      showCorrectness: true,
      revealAnswerExplanation: true,
      showIntroScreen: true,
      purpose: 'check_for_understanding',
      allowMultipleAttempts: false
    }, as: :json

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal 'Unit 3 Check for Understanding', body['displayName']
    assert_equal 'You have 20 minutes.', body['customIntroText']
    assert_equal 20, body['timeLimitMinutes']
    assert_equal true, body['showCorrectness']
    assert_equal true, body['revealAnswerExplanation']
    assert_equal true, body['showIntroScreen']
    assert_equal 'check_for_understanding', body['purpose']
    assert_equal false, body['allowMultipleAttempts']

    @quiz.reload
    assert_equal 'Unit 3 Check for Understanding', @quiz.display_name
    assert_equal 20, @quiz.time_limit_minutes
    assert_equal 'check_for_understanding', @quiz.purpose
  end

  test "update only touches fields present in the request, leaving the rest alone" do
    @quiz.update!(display_name: 'Original name', purpose: 'exam', custom_intro_text: 'Original intro')

    put :update, params: {level_id: @quiz.id, purpose: 'practice'}, as: :json

    assert_response :success
    @quiz.reload
    assert_equal 'practice', @quiz.purpose
    assert_equal 'Original name', @quiz.display_name
    assert_equal 'Original intro', @quiz.custom_intro_text
  end

  test "update clears a field given an explicit null, as opposed to omitting it" do
    @quiz.update!(custom_intro_text: 'Original intro')

    put :update, params: {level_id: @quiz.id, customIntroText: nil}, as: :json

    assert_response :success
    assert_nil @quiz.reload.custom_intro_text
  end

  test "update returns bad_request when a time limit is set without show_intro_screen" do
    put :update, params: {level_id: @quiz.id, timeLimitMinutes: 20, showIntroScreen: false}, as: :json

    assert_response :bad_request
  end

  test "update allows show_intro_screen: false with no time limit" do
    put :update, params: {level_id: @quiz.id, customIntroText: 'Welcome!', showIntroScreen: false}, as: :json

    assert_response :success
    refute @quiz.reload.show_intro_screen?
  end

  test "update coerces an ambiguous boolean-ish value like the string '0' to real false, not truthy" do
    # This is the exact scenario Dave flagged in review: a stored value like
    # "0" reads back truthy via show_correctness?, because JSONValue checks
    # integral? before boolean?. CAST_BOOLEAN must stop that string from
    # ever being written in the first place - see QuizzesController#update.
    put :update, params: {level_id: @quiz.id, showCorrectness: '0'}

    assert_response :success
    assert_equal false, JSON.parse(response.body)['showCorrectness']
    refute @quiz.reload.show_correctness?
  end

  test "update returns bad_request when the model's own validations reject the combination" do
    # as: :json matters here, not just for style consistency - without it,
    # false/true get form-encoded to the strings "false"/"true", and the
    # known JSONValue boolean-coercion quirk (see quiz_attempt.rb) could
    # make show_correctness? read back true regardless of what was sent,
    # masking the very rejection this test means to check for.
    put :update, params: {
      level_id: @quiz.id,
      showCorrectness: false,
      revealAnswerExplanation: true
    }, as: :json

    assert_response :bad_request
    assert JSON.parse(response.body)['error'].present?
  end

  test "update rejects a purpose outside the known list" do
    put :update, params: {level_id: @quiz.id, purpose: 'not_a_real_purpose'}

    assert_response :bad_request
  end
end

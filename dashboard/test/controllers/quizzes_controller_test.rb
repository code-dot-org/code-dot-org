require 'test_helper'

class QuizzesControllerTest < ActionController::TestCase
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
        question_title: 'Pick B',
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

  test "show marks a question deletable only when no other quiz uses it and no student has answered it" do
    only_here = create(:multiple_choice_question)
    shared = create(:multiple_choice_question)
    answered = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: only_here, page: 1, position: 1)
    create(:quiz_question_placement, level: @quiz, quiz_question: shared, page: 1, position: 2)
    create(:quiz_question_placement, level: @quiz, quiz_question: answered, page: 1, position: 3)
    create(:quiz_question_placement, level: create(:quiz), quiz_question: shared, page: 1, position: 1)
    create(:quiz_question_response, quiz_question: answered)

    get :show, params: {level_id: @quiz.id}

    assert_response :success
    deletable = JSON.parse(response.body)['questions'].to_h {|q| [q['id'], q['deletable']]}
    assert_equal({only_here.id => true, shared.id => false, answered.id => false}, deletable)
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
      allowMultipleAttempts: false,
      showQuestionsAfterSubmit: true
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
    assert_equal true, body['showQuestionsAfterSubmit']

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

  # --- placements through update ---

  test "show returns the quiz's version and whether it's used in a published unit" do
    Quiz.any_instance.stubs(:used_in_published_unit?).returns(true)

    get :show, params: {level_id: @quiz.id}

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal @quiz.reload.updated_at.to_i, body['version']
    assert_equal true, body['usedInPublishedUnit']
  end

  test "update adds and reorders placements, renumbering pages and positions from 1" do
    placed = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: placed, page: 1, position: 1)
    added = create(:free_response_question)

    put :update, as: :json, params: {
      level_id: @quiz.id, version: @quiz.reload.updated_at.to_i,
      placements: [
        {quizQuestionId: added.id, page: 4, position: 7},
        {quizQuestionId: placed.id, page: 9, position: 1},
      ]
    }

    assert_response :success
    expected = [
      {'quizQuestionId' => added.id, 'page' => 1, 'position' => 1},
      {'quizQuestionId' => placed.id, 'page' => 2, 'position' => 1},
    ]
    assert_equal expected, JSON.parse(response.body)['placements']
    assert_equal [[added.id, 1, 1], [placed.id, 2, 1]],
      (@quiz.placements.reload.map {|p| [p.quiz_question_id, p.page, p.position]})
  end

  test "update takes a question left out of placements off the quiz, keeping the question" do
    kept = create(:multiple_choice_question)
    removed = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: kept, page: 1, position: 1)
    create(:quiz_question_placement, level: @quiz, quiz_question: removed, page: 1, position: 2)

    put :update, as: :json, params: {
      level_id: @quiz.id, version: @quiz.reload.updated_at.to_i,
      placements: [{quizQuestionId: kept.id, page: 1, position: 1}]
    }

    assert_response :success
    assert_equal [kept.id], @quiz.placements.reload.map(&:quiz_question_id)
    assert QuizQuestion.exists?(removed.id)
  end

  test "update deletes a removed question in deleteQuestionIds only when nothing else uses it" do
    unused = create(:multiple_choice_question)
    shared = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: unused, page: 1, position: 1)
    create(:quiz_question_placement, level: @quiz, quiz_question: shared, page: 1, position: 2)
    create(:quiz_question_placement, level: create(:quiz), quiz_question: shared, page: 1, position: 1)

    put :update, as: :json, params: {
      level_id: @quiz.id, version: @quiz.reload.updated_at.to_i,
      placements: [], deleteQuestionIds: [unused.id, shared.id]
    }

    assert_response :success
    assert_empty @quiz.placements.reload
    refute QuizQuestion.exists?(unused.id)
    assert QuizQuestion.exists?(shared.id)
  end

  test "update refuses to delete a question that stays on the quiz" do
    question = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: question, page: 1, position: 1)

    put :update, as: :json, params: {
      level_id: @quiz.id, version: @quiz.reload.updated_at.to_i,
      placements: [{quizQuestionId: question.id, page: 1, position: 1}], deleteQuestionIds: [question.id]
    }

    assert_response :bad_request
    assert QuizQuestion.exists?(question.id)
  end

  test "update deletes a question created and deleted before it was ever placed" do
    unplaced = create(:multiple_choice_question)

    put :update, as: :json, params: {
      level_id: @quiz.id, version: @quiz.reload.updated_at.to_i,
      placements: [], deleteQuestionIds: [unplaced.id]
    }

    assert_response :success
    refute QuizQuestion.exists?(unplaced.id)
  end

  test "update returns conflict and changes nothing when the version is stale" do
    question = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: question, page: 1, position: 1)

    put :update, as: :json, params: {
      level_id: @quiz.id, version: @quiz.reload.updated_at.to_i - 1,
      displayName: 'Not saved', placements: []
    }

    assert_response :conflict
    assert_equal [question.id], @quiz.placements.reload.map(&:quiz_question_id)
    refute_equal 'Not saved', @quiz.reload.display_name
  end

  test "update returns conflict when another endpoint changed the placements since load" do
    question = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: question, page: 1, position: 1)
    version = @quiz.reload.saved_version

    travel 1.minute do
      attached = create(:multiple_choice_question)
      create(:quiz_question_placement, level: @quiz, quiz_question: attached, page: 1, position: 2)

      put :update, as: :json, params: {
        level_id: @quiz.id, version: version,
        placements: [{quizQuestionId: question.id, page: 1, position: 1}]
      }

      assert_response :conflict
      assert_includes @quiz.placements.reload.map(&:quiz_question_id), attached.id
    end
  end

  test "update returns bad_request and changes nothing for an unknown question id" do
    put :update, as: :json, params: {
      level_id: @quiz.id, version: @quiz.reload.updated_at.to_i,
      placements: [{quizQuestionId: 0, page: 1, position: 1}]
    }

    assert_response :bad_request
    assert_empty @quiz.placements.reload
  end

  test "update writes the quiz's .level file once for all its placements" do
    questions = create_list(:multiple_choice_question, 3)
    version = @quiz.reload.updated_at.to_i
    Services::LevelFiles.expects(:write_custom_level_file).once

    put :update, as: :json, params: {
      level_id: @quiz.id, version: version,
      placements: questions.each_with_index.map {|q, i| {quizQuestionId: q.id, page: 1, position: i + 1}}
    }

    assert_response :success
  end

  test "update returns the new version, without needing one for configuration fields alone" do
    put :update, as: :json, params: {level_id: @quiz.id, displayName: 'Renamed'}

    assert_response :success
    assert_equal @quiz.reload.updated_at.to_i, JSON.parse(response.body)['version']
  end

  test "update keeps an exam Quiz an exam while it is the last level of a lockable lesson" do
    @quiz.update!(purpose: 'exam')
    lesson = create(:lesson, lockable: true)
    create(:script_level, script: lesson.script, lesson: lesson, levels: [@quiz], assessment: true)

    put :update, params: {level_id: @quiz.id, purpose: 'practice'}

    assert_response :bad_request
    assert_equal 'exam', @quiz.reload.purpose
  end

  test "update lets an exam Quiz change purpose when it is not the last level of a lockable lesson" do
    @quiz.update!(purpose: 'exam')

    put :update, params: {level_id: @quiz.id, purpose: 'practice'}

    assert_response :success
    assert_equal 'practice', @quiz.reload.purpose
  end

  test "update refuses exam when the Quiz is in a lesson that is not lockable" do
    create(:script_level, levels: [@quiz], lesson: create(:lesson, lockable: false))
    put :update, params: {level_id: @quiz.id, purpose: 'exam'}

    assert_response :bad_request
    assert_includes JSON.parse(response.body)['error'], 'is not lockable'
    refute @quiz.reload.exam?
  end

  test "update refuses exam when the Quiz is not the last level in its lesson" do
    script = create(:script)
    lesson = create(:lesson, script: script, lockable: true)
    create(:script_level, script: script, lesson: lesson, levels: [@quiz], chapter: 1, position: 1)
    create(:script_level, script: script, lesson: lesson, levels: [create(:quiz)], assessment: true, chapter: 2, position: 2)
    put :update, params: {level_id: @quiz.id, purpose: 'exam'}

    assert_response :bad_request
    assert_includes JSON.parse(response.body)['error'], 'not the last level'
  end

  test "update refuses exam when the Quiz is a sublevel" do
    ParentLevelsChildLevel.create!(parent_level: create(:bubble_choice_level), child_level: @quiz, kind: ParentLevelsChildLevel::SUBLEVEL)
    put :update, params: {level_id: @quiz.id, purpose: 'exam'}

    assert_response :bad_request
    assert_includes JSON.parse(response.body)['error'], 'is a sublevel of'
  end

  test "update allows exam when the Quiz ends a lockable lesson, or is not placed" do
    put :update, params: {level_id: create(:quiz).id, purpose: 'exam'}
    assert_response :success

    create(:script_level, levels: [@quiz], assessment: true, lesson: create(:lesson, lockable: true))
    put :update, params: {level_id: @quiz.id, purpose: 'exam'}
    assert_response :success
    assert @quiz.reload.exam?
  end
end

require 'test_helper'

class QuizQuestionsControllerTest < ActionController::TestCase
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

  test "index redirects to sign in when not signed in" do
    sign_out @levelbuilder
    get :index, params: {level_id: @quiz.id}
    assert_redirected_to_sign_in
  end

  test "index is forbidden for a non-levelbuilder" do
    sign_in @teacher
    get :index, params: {level_id: @quiz.id}
    assert_response :forbidden
  end

  test "show 404s on a level that is not a Quiz" do
    level = create(:level)
    get :show, params: {level_id: level.id, id: @question.id}
    assert_response :not_found
  end

  # --- index ---

  test "index marks bank questions attached: true/false relative to this quiz" do
    other_question = create(:multiple_choice_question)

    get :index, params: {level_id: @quiz.id, limit: 10}

    assert_response :success
    body = JSON.parse(response.body)
    attached_flags = body.index_by {|q| q['id']}.transform_values {|q| q['attached']}
    assert_equal true, attached_flags[@question.id]
    assert_equal false, attached_flags[other_question.id]
  end

  test "index reports attachedToOtherQuizzes and usedInPublishedUnit correctly, computed in bulk" do
    other_quiz = create(:quiz)
    unit = create(:unit, :in_single_unit_course, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    create(:script_level, script: unit, levels: [other_quiz])

    shared_and_published = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: shared_and_published, page: 1, position: 2)
    create(:quiz_question_placement, level: other_quiz, quiz_question: shared_and_published, page: 1, position: 1)

    get :index, params: {level_id: @quiz.id, limit: 10}

    assert_response :success
    by_id = JSON.parse(response.body).index_by {|q| q['id']}
    assert_equal true, by_id[shared_and_published.id]['attachedToOtherQuizzes']
    assert_equal true, by_id[shared_and_published.id]['usedInPublishedUnit']
    assert_equal false, by_id[@question.id]['attachedToOtherQuizzes']
    assert_equal false, by_id[@question.id]['usedInPublishedUnit']
  end

  # Regression test for a Copilot review finding: quiz_question_json used
  # to run several queries (standards, attachedToOtherQuizzes,
  # usedInPublishedUnit's levels->script_levels->script chain, page) PER
  # question, so index's query count scaled with the page size. Asserts
  # the fix by comparing two page sizes - a real N+1 would make the larger
  # page issue more queries; the bulk-precomputed version issues the same
  # count either way.
  test "index's query count does not scale with the number of questions returned" do
    unit = create(:unit, :in_single_unit_course, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    other_quiz = create(:quiz)
    create(:script_level, script: unit, levels: [other_quiz])
    standard = create(:standard)

    build_questions = lambda do |count|
      count.times do
        q = create(:multiple_choice_question)
        create(:quiz_question_placement, level: @quiz, quiz_question: q, page: 1, position: q.id)
        q.standards << standard
        create(:quiz_question_placement, level: other_quiz, quiz_question: q, page: 1, position: q.id)
      end
    end

    count_queries = lambda do
      count = 0
      subscriber = ActiveSupport::Notifications.subscribe('sql.active_record') do |*, payload|
        count += 1 unless payload[:name].to_s.match?(/SCHEMA|TRANSACTION/)
      end
      get :index, params: {level_id: @quiz.id, limit: 30}
      assert_response :success
      ActiveSupport::Notifications.unsubscribe(subscriber)
      count
    end

    build_questions.call(2)
    small_page_queries = count_queries.call

    build_questions.call(8)
    large_page_queries = count_queries.call

    assert_equal small_page_queries, large_page_queries
  end

  test "index narrows by standard when both standardFrameworkShortcode and standardShortcode are given" do
    standard = create(:standard)
    tagged = create(:multiple_choice_question)
    create(:quiz_question_standard, quiz_question: tagged, standard: standard)

    get :index, params: {
      level_id: @quiz.id,
      standardFrameworkShortcode: standard.framework.shortcode,
      standardShortcode: standard.shortcode
    }

    assert_response :success
    ids = JSON.parse(response.body).pluck('id')
    assert_includes ids, tagged.id
    refute_includes ids, @question.id
  end

  # --- course_unit_search (not level-type-gated - doesn't touch @level) ---

  test "course_unit_search returns [] for a query shorter than MIN_WORD_LENGTH" do
    get :course_unit_search, params: {level_id: @quiz.id, query: 'ab'}
    assert_response :success
    assert_equal [], JSON.parse(response.body)
  end

  test "course_unit_search matches units and courses by name substring" do
    unit = create(:unit, name: 'zzz-matching-unit')
    course = create(:unit_group, name: 'zzz-matching-course')

    get :course_unit_search, params: {level_id: @quiz.id, query: 'zzz-matching'}

    assert_response :success
    results = JSON.parse(response.body)
    assert_includes results, {'type' => 'unit', 'id' => unit.id, 'name' => unit.name}
    assert_includes results, {'type' => 'course', 'id' => course.id, 'name' => course.name}
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

  # --- update: in-place vs. fork ---

  test "update edits the question in place when it's not used in a published unit" do
    put :update, params: {
      level_id: @quiz.id, id: @question.id,
      questionName: 'Edited name', stem: 'Edited stem',
      choices: [{id: 'a', text: '1'}, {id: 'b', text: '2'}], correctChoiceId: 'a'
    }

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal @question.id, body['id']
    assert_equal 'Edited name', @question.reload.name
    assert_equal @question.id, @quiz.reload.placements.sole.quiz_question_id
  end

  test "update forks instead of mutating when the question is used in a published unit" do
    unit = create(:unit)
    create(:single_unit_course, unit: unit, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    create(:script_level, script: unit, levels: [@quiz])
    original_content = @question.content

    assert_difference 'QuizQuestion.count', 1 do
      put :update, params: {
        level_id: @quiz.id, id: @question.id,
        questionName: 'Forked name', stem: 'Forked stem',
        choices: [{id: 'a', text: '1'}, {id: 'b', text: '2'}], correctChoiceId: 'a'
      }
    end

    assert_response :success
    forked_id = JSON.parse(response.body)['id']
    refute_equal @question.id, forked_id

    forked = MultipleChoiceQuestion.find(forked_id)
    assert_equal @question, forked.parent
    assert_equal 'Forked name', forked.name

    @question.reload
    assert_equal original_content, @question.content

    assert_equal forked.id, @quiz.placements.sole.quiz_question_id
  end

  test "update forks when the client explicitly sends editMode: fork, even if not published" do
    assert_difference 'QuizQuestion.count', 1 do
      put :update, params: {
        level_id: @quiz.id, id: @question.id, editMode: 'fork',
        questionName: 'Forked by request', stem: 'stem',
        choices: [{id: 'a', text: '1'}, {id: 'b', text: '2'}], correctChoiceId: 'a'
      }
    end

    assert_response :success
    refute_equal @question.id, JSON.parse(response.body)['id']
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
end

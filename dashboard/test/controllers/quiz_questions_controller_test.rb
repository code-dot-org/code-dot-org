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
    get :index, params: {quizLevelId: @quiz.id}
    assert_redirected_to_sign_in
  end

  test "index is forbidden for a non-levelbuilder" do
    sign_in @teacher
    get :index, params: {quizLevelId: @quiz.id}
    assert_response :forbidden
  end

  # --- index ---

  # index's default (blank search) mode browses the N most recent
  # MultipleChoiceQuestion rows system-wide, not scoped to this test's own
  # data - so asserting on specific rows this way is only reliable if
  # nothing else in the table can outrank them within the limit. Tagging
  # this test's own questions with a Standard created fresh here, then
  # filtering by it (same mechanism "index narrows by standard..." already
  # relies on, via a real JOIN/WHERE - not fulltext, so it isn't subject to
  # MySQL's separate "fulltext can't see same-transaction inserts"
  # limitation) guarantees the result set is only ever this test's own
  # rows, regardless of what else exists.
  test "index marks bank questions attached: true/false relative to this quiz" do
    standard = create(:standard)
    @question.standards << standard
    other_question = create(:multiple_choice_question)
    other_question.standards << standard

    get :index, params: {
      quizLevelId: @quiz.id,
      standardFrameworkShortcode: standard.framework.shortcode,
      standardShortcode: standard.shortcode,
      limit: 10
    }

    assert_response :success
    body = JSON.parse(response.body)
    attached_flags = body.index_by {|q| q['id']}.transform_values {|q| q['attached']}
    assert_equal true, attached_flags[@question.id]
    assert_equal false, attached_flags[other_question.id]
  end

  test "index reports attachedToOtherQuizzes and usedInPublishedUnit correctly, computed in bulk" do
    standard = create(:standard)
    other_quiz = create(:quiz)
    unit = create(:unit, :in_single_unit_course, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    create(:script_level, script: unit, levels: [other_quiz])

    shared_and_published = create(:multiple_choice_question)
    shared_and_published.standards << standard
    create(:quiz_question_placement, level: @quiz, quiz_question: shared_and_published, page: 1, position: 2)
    create(:quiz_question_placement, level: other_quiz, quiz_question: shared_and_published, page: 1, position: 1)
    @question.standards << standard

    get :index, params: {
      quizLevelId: @quiz.id,
      standardFrameworkShortcode: standard.framework.shortcode,
      standardShortcode: standard.shortcode,
      limit: 10
    }

    assert_response :success
    body = JSON.parse(response.body)
    by_id = body.index_by {|q| q['id']}
    assert_equal true, by_id[shared_and_published.id]['attachedToOtherQuizzes']
    assert_equal true, by_id[shared_and_published.id]['usedInPublishedUnit']
    assert_equal false, by_id[@question.id]['attachedToOtherQuizzes']
    assert_equal false, by_id[@question.id]['usedInPublishedUnit']
  end

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
      get :index, params: {quizLevelId: @quiz.id, limit: 30}
      assert_response :success
      ActiveSupport::Notifications.unsubscribe(subscriber)
      count
    end

    # Warms up the session before either measurement - the very first
    # request in a signed-in test does one-time auth/session queries
    # (users, experiments, lti_user_identities, user_permissions) that a
    # later request in the same session doesn't repeat. Without this, the
    # "small" measurement below would include that overhead and the "large"
    # one wouldn't, comparing cold-request cost against the index
    # optimization itself.
    count_queries.call

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
      quizLevelId: @quiz.id,
      standardFrameworkShortcode: standard.framework.shortcode,
      standardShortcode: standard.shortcode
    }

    assert_response :success
    ids = JSON.parse(response.body).pluck('id')
    assert_includes ids, tagged.id
    refute_includes ids, @question.id
  end

  # quizLevelId missing falls into the same "no results" bucket as an
  # unresolvable course/unit id below, rather than a hard error - nothing
  # yet browses the bank outside a specific quiz's builder, so there's no
  # meaningful result set to return either way.
  test "index returns [] when quizLevelId is missing - nothing yet browses the bank outside a specific quiz's builder" do
    get :index, params: {}
    assert_response :success
    assert_equal [], JSON.parse(response.body)
  end

  # --- course_unit_search (level-independent - top-level route, no :level_id) ---

  test "course_unit_search returns [] for a query shorter than MIN_WORD_LENGTH" do
    get :course_unit_search, params: {query: 'ab'}
    assert_response :success
    assert_equal [], JSON.parse(response.body)
  end

  test "course_unit_search matches units and courses by name substring" do
    unit = create(:unit, name: 'zzz-matching-unit')
    course = create(:unit_group, name: 'zzz-matching-course')

    get :course_unit_search, params: {query: 'zzz-matching'}

    assert_response :success
    results = JSON.parse(response.body)
    assert_includes results, {'type' => 'unit', 'id' => unit.id, 'name' => unit.name}
    assert_includes results, {'type' => 'course', 'id' => course.id, 'name' => course.name}
  end

  test "course_unit_search escapes % and _ so they match literally, not as wildcards" do
    create(:unit, name: 'zzzalgorithms-and-rhythms')

    get :course_unit_search, params: {query: 'zzzalgo%rithm'}

    assert_response :success
    assert_equal [], JSON.parse(response.body)
  end

  # --- show ---

  # Regression test for a review finding on the level-nested predecessor of
  # this controller: show used to be @level.questions.find(params[:id]),
  # 404ing for a real question that just wasn't attached to whichever quiz
  # happened to be in the URL. show is level-independent now - any bank
  # question is reachable by its own id, attached anywhere or not.
  test "show works for a bank question not attached to any quiz" do
    unattached = create(:multiple_choice_question)

    get :show, params: {id: unattached.id}

    assert_response :success
    assert_equal unattached.id, JSON.parse(response.body)['id']
  end

  # --- update: in-place vs. fork ---

  test "update edits the question in place when it's not used in a published unit" do
    put :update, params: {
      id: @question.id, quizLevelId: @quiz.id,
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
        id: @question.id, quizLevelId: @quiz.id,
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
        id: @question.id, quizLevelId: @quiz.id, editMode: 'fork',
        questionName: 'Forked by request', stem: 'stem',
        choices: [{id: 'a', text: '1'}, {id: 'b', text: '2'}], correctChoiceId: 'a'
      }
    end

    assert_response :success
    refute_equal @question.id, JSON.parse(response.body)['id']
  end

  test "update rolls back the forked question entirely when standard assignment fails" do
    unit = create(:unit)
    create(:single_unit_course, unit: unit, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    create(:script_level, script: unit, levels: [@quiz])

    assert_no_difference 'QuizQuestion.count' do
      put :update, params: {
        id: @question.id, quizLevelId: @quiz.id,
        questionName: 'Forked name', stem: 'Forked stem',
        choices: [{id: 'a', text: '1'}, {id: 'b', text: '2'}], correctChoiceId: 'a',
        standards: [{frameworkShortcode: 'not-a-real-framework', shortcode: 'not-a-real-standard'}]
      }
    end

    assert_response :bad_request
    assert_equal @question.id, @quiz.reload.placements.sole.quiz_question_id
  end

  # quizLevelId is optional - editing a question with no particular quiz
  # in view (e.g. a future standalone bank-management screen) still works,
  # touching no placement.
  test "update edits the question in place when no quizLevelId is given" do
    unattached = create(:multiple_choice_question)

    put :update, params: {
      id: unattached.id,
      questionName: 'Edited name', stem: 'Edited stem',
      choices: [{id: 'a', text: '1'}, {id: 'b', text: '2'}], correctChoiceId: 'a'
    }

    assert_response :success
    assert_equal 'Edited name', unattached.reload.name
  end
end

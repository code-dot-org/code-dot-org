require 'test_helper'

class AdaptiveProgressControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @dir = Pathname.new(Dir.mktmpdir)
    @dir.join('progress.json').write({
      'id' => 'progress',
      'project' => {'templateLevel' => 'adaptive-progress-template', 'description' => 'A site.'},
      'checkpoints' => [{
        'id' => 'basics',
        'steps' => [
          {'id' => 'read', 'kind' => 'panels', 'panels' => []},
          {'id' => 'quiz', 'kind' => 'questions', 'questions' => [
            {'id' => 1, 'type' => 'MultipleChoiceQuestion', 'choices' => [{'id' => 'a'}, {'id' => 'b'}], 'correctChoiceId' => 'b'},
            {'id' => 2, 'type' => 'MultipleChoiceQuestion', 'choices' => [{'id' => 'a'}, {'id' => 'b'}]},
            {'id' => 'why', 'type' => 'freeResponse', 'text' => 'Why?'},
            {'id' => 'how', 'type' => 'scale', 'text' => 'How much?', 'scale' => {'min' => 1, 'max' => 5}},
          ]},
          {'id' => 'try', 'kind' => 'level', 'level' => 'adaptive-progress-sandbox', 'project' => true, 'instructionsPrompt' => 'Build on their page.'},
          {'id' => 'retry', 'kind' => 'level', 'level' => 'adaptive-progress-sandbox'},
        ],
      }],
    }.to_json
    )
    AdaptiveContent.stubs(:content_dir).returns(@dir)
    AdaptiveContent.reset_cache!

    @sandbox = create(:weblab2, name: 'adaptive-progress-sandbox')
    @template = create(:weblab2, name: 'adaptive-progress-template')
    @level = create(:adaptive, adaptive_id: 'progress')
    @unit = create(:script_level, levels: [@level]).script
    @student = create(:student)
    sign_in @student
  end

  teardown do
    AdaptiveContent.reset_cache!
    FileUtils.remove_entry(@dir)
  end

  test "refuses a signed-out request" do
    sign_out @student

    assert_no_difference 'UserAdaptiveStep.count' do
      put_step 'read', started: true
    end
    assert_response :unauthorized
  end

  test "refuses a level that is not adaptive" do
    other = create(:script_level).level

    get :show, params: {scriptId: @unit.id, levelId: other.id}

    assert_response :not_found
  end

  test "refuses an adaptive level that is not in the unit" do
    get :show, params: {scriptId: create(:unit).id, levelId: @level.id}

    assert_response :not_found
  end

  test "show is empty for a student with no progress" do
    get :show, params: params

    assert_response :success
    assert_equal({'steps' => {}}, JSON.parse(response.body))
  end

  test "starting a step creates the adaptive user level as started" do
    put_step 'read', started: true

    assert_response :success
    user_level = UserLevel.find_by(user: @student, level: @level, script: @unit)
    assert_equal AdaptiveProgressController::LEVEL_STARTED_RESULT, user_level.best_result
    assert_equal 'started', JSON.parse(response.body)['status']
  end

  test "started and completed times are set once" do
    travel_to Time.utc(2026, 10, 8, 17) do
      put_step 'read', started: true
    end
    travel_to Time.utc(2026, 10, 8, 18) do
      put_step 'read', started: true, completed: true
    end
    travel_to Time.utc(2026, 10, 8, 19) do
      put_step 'read', completed: true
    end

    entry = steps['read']
    assert_equal 'complete', entry['status']
    assert_equal '2026-10-08T17:00:00Z', entry['startedAt']
    assert_equal '2026-10-08T18:00:00Z', entry['completedAt']
  end

  test "time since the last save is summed in whole seconds" do
    put_step 'read', started: true, timeSinceLastSave: 1500
    put_step 'read', timeSinceLastSave: 1500

    assert_equal 4, steps['read']['timeSpent']
  end

  test "answers replace one question's list and are checked against the content" do
    put_step 'quiz', answers: {questionId: 1, list: [{answerId: 'a', isCorrect: true}]}
    put_step 'quiz', answers: {questionId: 2, list: [{answerId: 'a'}]}
    put_step 'quiz', submitted: false, answers: {questionId: 1, list: [{answerId: 'a', isCorrect: true}, {answerId: 'b'}]}

    entry = steps['quiz']
    assert_equal(
      {
        '1' => [{'answerId' => 'a', 'isCorrect' => false}, {'answerId' => 'b', 'isCorrect' => true}],
        '2' => [{'answerId' => 'a'}],
      },
      entry['answers']
    )
    assert entry['submitted']
  end

  test "free response answers are stored as text without correctness" do
    put_step 'quiz', answers: {questionId: 'why', list: [{text: 'Because.', isCorrect: true}]}

    assert_equal [{'text' => 'Because.'}], steps['quiz']['answers']['why']
  end

  test "refuses invalid saves and stores nothing" do
    [
      ['nowhere', {started: true}],
      ['try', {started: true}],
      ['try', {timeSinceLastSave: 1000}],
      ['quiz', {answers: {list: [{answerId: 'a'}]}}],
      ['quiz', {answers: {questionId: 9, list: [{answerId: 'a'}]}}],
      ['quiz', {answers: {questionId: 'how', list: [{answerId: '3'}]}}],
      ['quiz', {answers: {questionId: 1, list: [{answerId: 'z'}]}}],
      ['quiz', {answers: {questionId: 1, list: [{text: 'a'}]}}],
      ['quiz', {answers: {questionId: 'why', list: [{text: 'x' * 10_001}]}}],
      ['read', {timeSinceLastSave: 'soon'}],
      ['try', {}],
      ['try', {skipped: true, started: true}],
      ['try', {skipped: true, timeSinceLastSave: 1000}],
      ['try', {skipped: false}],
    ].each do |step_id, body|
      assert_no_difference ['UserAdaptiveStep.count', 'UserLevel.count'] do
        put_step step_id, **body
      end
      assert_response :unprocessable_entity, "#{step_id} #{body}"
    end
  end

  test "generated instructions are saved on a project step with a prompt without starting it" do
    generated = {'instructions' => 'Do this.', 'inputsHash' => 'ab'}

    put_instructions 'try', generated

    assert_response :success
    row = UserAdaptiveStep.find_by(step_id: 'try')
    assert_equal generated, row.generated_instructions
    assert_nil row.progress
    assert_equal({'timeSpent' => 0, 'generatedInstructions' => generated}, steps['try'])
  end

  test "refuses invalid generated instructions and stores nothing" do
    [
      ['nowhere', {'instructions' => 'Do this.'}],
      ['read', {'instructions' => 'Do this.'}],
      ['retry', {'instructions' => 'Do this.'}],
      ['project', {'instructions' => 'Do this.'}],
      ['try', 'text'],
      ['try', {'instructions' => 'x' * 70_000}],
    ].each do |step_id, generated|
      assert_no_difference ['UserAdaptiveStep.count', 'UserLevel.count'] do
        put_instructions step_id, generated
      end
      assert_response :unprocessable_entity, "#{step_id} #{generated}"
    end
  end

  test "validation history is not implemented" do
    assert_no_difference ['UserAdaptiveStep.count', 'UserLevel.count'] do
      put :update_validation_history, params: {step_id: 'try', **params}, as: :json
    end
    assert_response :not_implemented
    assert JSON.parse(response.body)['error'].present?
  end

  test "a skipped step reads as skipped until the student starts it" do
    put_step 'read', skipped: true

    assert_response :success
    assert_equal({'status' => 'skipped', 'timeSpent' => 0}, JSON.parse(response.body))
    assert_equal 'skipped', steps['read']['status']

    put_step 'read', started: true
    assert_equal 'started', steps['read']['status']
  end

  test "a completed step stays complete when skipped" do
    put_step 'read', started: true
    put_step 'read', completed: true
    put_step 'read', skipped: true

    assert_equal 'complete', steps['read']['status']
  end

  test "a level step can be skipped, and its user level wins once the student opens it" do
    put_step 'try', skipped: true

    assert_response :success
    assert_equal({'status' => 'skipped', 'timeSpent' => 0}, steps['try'])

    create(:user_level, user: @student, level: @sandbox, script: @unit, best_result: -150, time_spent: 4)
    assert_equal({'status' => 'started', 'timeSpent' => 4}, steps['try'])
  end

  test "level steps take their state from the step level's user level" do
    put_instructions 'try', {'instructions' => 'Do this.'}
    user_level = create(:user_level, user: @student, level: @sandbox, script: @unit, best_result: -150, time_spent: 12)

    assert_equal(
      {'status' => 'started', 'timeSpent' => 12, 'generatedInstructions' => {'instructions' => 'Do this.'}},
      steps['try']
    )

    user_level.update!(best_result: ActivityConstants::FREE_PLAY_RESULT)
    assert_equal 'complete', steps['try']['status']
  end

  test "steps that share a level both take its user level's state" do
    create(:user_level, user: @student, level: @sandbox, script: @unit, best_result: -150, time_spent: 7)

    assert_equal steps['try'], steps['retry']
    assert_equal({'status' => 'started', 'timeSpent' => 7}, steps['retry'])
  end

  test "the project takes its state from the template level's user level" do
    create(:user_level, user: @student, level: @template, script: @unit, best_result: -150, time_spent: 5)

    assert_equal({'status' => 'started', 'timeSpent' => 5}, steps['project'])
  end

  test "saves that change nothing do not start a step" do
    put_step 'read', started: false
    put_step 'read', completed: false
    put_step 'read', timeSinceLastSave: 0

    assert_response :success
    assert_equal({}, JSON.parse(response.body))
    assert_empty steps
  end

  test "another student's progress is not shown" do
    put_step 'read', started: true
    sign_out @student
    sign_in create(:student)

    assert_empty steps
  end

  private def params
    {scriptId: @unit.id, levelId: @level.id}
  end

  private def put_step(step_id, **body)
    put :update_progress, params: {step_id: step_id, **params, **body}, as: :json
  end

  private def put_instructions(step_id, generated)
    put :update_generated_instructions, params: {step_id: step_id, **params, generatedInstructions: generated}, as: :json
  end

  private def steps
    get :show, params: params
    JSON.parse(response.body)['steps']
  end
end

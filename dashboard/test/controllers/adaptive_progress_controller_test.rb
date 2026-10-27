require 'test_helper'

class AdaptiveProgressControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @dir = Pathname.new(Dir.mktmpdir)
    @dir.join('progress.json').write({
      'id' => 'progress',
      'project' => {'templateLevel' => 'adaptive-progress-template', 'description' => 'A site.'},
      'skills' => {'build' => {'id' => 'build', 'evidenceLevels' => {'0' => 'Nothing yet', '1' => 'A start', '2' => 'Built'}}},
      'checkpoints' => [{
        'id' => 'basics',
        'skillIds' => ['build'],
        'steps' => [
          {'id' => 'read', 'kind' => 'panels', 'panels' => []},
          {'id' => 'quiz', 'kind' => 'questions', 'questions' => [
            {'id' => 1, 'type' => 'MultipleChoiceQuestion', 'choices' => [{'id' => 'a'}, {'id' => 'b'}], 'correctChoiceId' => 'b'},
            {'id' => 2, 'type' => 'MultipleChoiceQuestion', 'choices' => [{'id' => 'a'}, {'id' => 'b'}]},
            {'id' => 'why', 'type' => 'freeResponse', 'text' => 'Why?'},
            {'id' => 'how', 'type' => 'scale', 'text' => 'How much?', 'scale' => {'min' => 1, 'max' => 5}},
          ]},
          {'id' => 'try', 'kind' => 'level', 'level' => 'adaptive-progress-sandbox', 'project' => true, 'instructionsPrompt' => 'Build on their page.',
           'validation' => {'condition' => 'Adds a heading.', 'measures' => {'skillId' => 'build'}}},
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

  test "show returns each step's completion status so the frontend can compute where to resume" do
    put_step 'read', started: true, completed: true
    put_step 'quiz', started: true

    all = steps
    assert_equal 'complete', all['read']['status']
    assert_equal 'started',  all['quiz']['status']
    # stepIdToResume on the frontend scans these statuses left-to-right for the
    # first step that is not complete.  Both non-level and level steps must
    # return a status field for that scan to work across sessions.
  end

  test "validation attempts are appended with the server's time and shown with the level's state" do
    travel_to Time.utc(2026, 10, 21, 17) do
      put_validation 'try', {'pass' => false, 'evidenceLevel' => 1, 'reason' => 'No heading yet.', 'at' => 'yesterday'}
    end
    assert_response :success
    travel_to Time.utc(2026, 10, 21, 18) do
      put_validation 'try', {'pass' => true, 'evidenceLevel' => 2, 'reason' => 'Heading added.', 'traceId' => 'trace-2'}
    end
    create(:user_level, user: @student, level: @sandbox, script: @unit, best_result: -150, time_spent: 12)

    entry = steps['try']
    assert_equal 'started', entry['status']
    assert_equal(
      [
        {'at' => '2026-10-21T17:00:00Z', 'pass' => false, 'evidenceLevel' => 1, 'reason' => 'No heading yet.'},
        {'at' => '2026-10-21T18:00:00Z', 'pass' => true, 'evidenceLevel' => 2, 'reason' => 'Heading added.', 'traceId' => 'trace-2'},
      ],
      entry['validationHistory']
    )
    assert_nil UserAdaptiveStep.find_by(step_id: 'try').progress
  end

  test "only the last validation attempts are kept" do
    25.times do |i|
      put_validation 'try', {'pass' => false, 'evidenceLevel' => 0, 'reason' => "Try #{i}"}
    end

    history = steps['try']['validationHistory']
    assert_equal UserAdaptiveStep::MAX_VALIDATION_ATTEMPTS, history.length
    assert_equal 'Try 24', history.last['reason']
  end

  test "refuses invalid validation attempts and stores nothing" do
    good = {'pass' => true, 'evidenceLevel' => 1, 'reason' => 'Fine.'}
    [
      ['nowhere', good],
      ['read', good],
      ['retry', good],
      ['project', good],
      ['try', nil],
      ['try', 'text'],
      ['try', good.merge('pass' => 'yes')],
      ['try', good.merge('evidenceLevel' => 3)],
      ['try', good.merge('evidenceLevel' => '1')],
      ['try', good.merge('evidenceLevel' => -1)],
      ['try', good.merge('reason' => 'x' * 10_001)],
      ['try', good.except('reason')],
      ['try', good.merge('traceId' => 7)],
    ].each do |step_id, attempt|
      assert_no_difference ['UserAdaptiveStep.count', 'UserLevel.count'] do
        put_validation step_id, attempt
      end
      assert_response :unprocessable_entity, "#{step_id} #{attempt}"
    end
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

  private def put_validation(step_id, attempt)
    put :update_validation_history, params: {step_id: step_id, **params, attempt: attempt}, as: :json
  end

  private def steps
    get :show, params: params
    JSON.parse(response.body)['steps']
  end
end

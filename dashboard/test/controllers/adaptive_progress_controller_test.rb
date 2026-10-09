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
          {'id' => 'try', 'kind' => 'level', 'level' => 'adaptive-progress-sandbox'},
        ],
      }],
    }.to_json
    )
    AdaptiveContent.stubs(:content_dir).returns(@dir)
    AdaptiveContent.reset_cache!

    @sandbox = create(:weblab2, name: 'adaptive-progress-sandbox')
    create(:weblab2, name: 'adaptive-progress-template')
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

  test "answers replace one question's list and are graded by the content" do
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
      ['quiz', {answers: {questionId: 9, list: [{answerId: 'a'}]}}],
      ['quiz', {answers: {questionId: 'how', list: [{answerId: '3'}]}}],
      ['quiz', {answers: {questionId: 1, list: [{answerId: 'z'}]}}],
      ['quiz', {answers: {questionId: 1, list: [{text: 'a'}]}}],
      ['quiz', {answers: {questionId: 'why', list: [{text: 'x' * 10_001}]}}],
      ['read', {timeSinceLastSave: 'soon'}],
      ['read', {started: true, generatedInstructions: 'text'}],
      ['try', {generatedInstructions: {'instructions' => 'x' * 70_000}}],
    ].each do |step_id, body|
      assert_no_difference ['UserAdaptiveStep.count', 'UserLevel.count'] do
        put_step step_id, **body
      end
      assert_response :unprocessable_entity, "#{step_id} #{body}"
    end
  end

  test "level steps accept generated instructions and validation history" do
    generated = {'instructions' => 'Do this.', 'inputsHash' => 'ab'}

    put_step 'try', generatedInstructions: generated, validationHistory: [{'passed' => false}]
    put_step 'project', generatedInstructions: generated

    assert_response :success
    rows = UserAdaptiveStep.where(step_id: %w(try project)).index_by(&:step_id)
    assert_equal generated, rows['try'].generated_instructions
    assert_equal [{'passed' => false}], rows['try'].validation_history
    assert_nil rows['try'].progress
    assert_equal generated, rows['project'].generated_instructions
    assert_empty steps, 'a row without progress is not a started step'
  end

  test "level steps take their state from the step level's user level" do
    put_step 'try', generatedInstructions: {'instructions' => 'Do this.'}
    user_level = create(:user_level, user: @student, level: @sandbox, script: @unit, best_result: -150, time_spent: 12)

    assert_equal({'status' => 'started', 'timeSpent' => 12}, steps['try'])

    user_level.update!(best_result: ActivityConstants::FREE_PLAY_RESULT)
    assert_equal 'complete', steps['try']['status']
  end

  test "destroy clears steps and step levels but keeps the adaptive user level" do
    put_step 'read', started: true
    put_step 'quiz', answers: {questionId: 1, list: [{answerId: 'b'}]}
    step_user_level = create(:user_level, user: @student, level: @sandbox, script: @unit, best_result: 30)

    delete :destroy, params: params

    assert_response :no_content
    assert_equal({}, steps)
    assert UserLevel.exists?(user: @student, level: @level, script: @unit)
    assert UserLevel.with_deleted.find(step_user_level.id).deleted?
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
    put :update_step, params: {step_id: step_id, **params, **body}, as: :json
  end

  private def steps
    get :show, params: params
    JSON.parse(response.body)['steps']
  end
end

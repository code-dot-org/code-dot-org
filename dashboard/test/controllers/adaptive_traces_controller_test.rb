require 'test_helper'

class AdaptiveTracesControllerTest < ActionController::TestCase
  setup do
    @student = create(:student)
    @params = {
      traceId: 'ab' * 16,
      traceName: 'adaptive-instructions',
      levelId: 7,
      model: 'gemini-2.5-flash',
      prompt: 'Write instructions.',
      output: {instructions: 'Do this.'},
      outcome: 'success',
      usage: {input: 10, output: 2, total: 12},
      startedAt: 1_767_225_600_000,
      endedAt: 1_767_225_602_000,
      metadata: {pathwayId: 'p', stepId: 's', inputsHash: 'h', promptVersion: 'v1', nested: {no: 1}, secret: 'nope'},
    }
  end

  def allow_adaptive_ai(allowed)
    User.any_instance.stubs(:can_access_aichat_chat_completion?).
      with(SharedConstants::AI_CHAT_CLIENT_TYPES[:ADAPTIVE], 7).
      returns(allowed)
  end

  def capture_trace(**overrides)
    captured = nil
    LangfuseHelper.expects(:trace_adaptive_generation).with do |opts|
      captured = opts
      true
    end
    post :create, params: @params.merge(overrides), as: :json
    captured
  end

  test 'rejects a signed-out request' do
    LangfuseHelper.expects(:trace_adaptive_generation).never

    post :create, params: @params, as: :json

    assert_response :unauthorized
  end

  test 'refuses a user who cannot use adaptive AI' do
    sign_in(@student)
    allow_adaptive_ai(false)
    LangfuseHelper.expects(:trace_adaptive_generation).never

    post :create, params: @params, as: :json

    assert_response :forbidden
  end

  test 'relays a successful generation under the signed-in user' do
    sign_in(@student)
    allow_adaptive_ai(true)

    opts = capture_trace

    assert_response :success
    assert_equal 'ab' * 16, JSON.parse(response.body)['traceId']
    assert_equal 'ab' * 16, opts[:trace_id]
    assert_equal 'adaptive-instructions', opts[:trace_name]
    assert_equal @student.id, opts[:user_id]
    assert_equal 'gemini-2.5-flash', opts[:model]
    assert_equal 'Write instructions.', opts[:input]
    assert_equal({'instructions' => 'Do this.'}, opts[:output])
    assert_equal 'success', opts[:outcome]
    assert_nil opts[:error_message]
    assert_equal({input: 10, output: 2, total: 12}, opts[:usage])
    assert_equal Time.utc(2026, 1, 1, 0, 0, 0), opts[:start_time]
    assert_equal Time.utc(2026, 1, 1, 0, 0, 2), opts[:end_time]
  end

  test 'keeps only allowlisted scalar metadata, snake cased, plus the level' do
    sign_in(@student)
    allow_adaptive_ai(true)

    opts = capture_trace

    assert_equal({pathway_id: 'p', step_id: 's', inputs_hash: 'h', prompt_version: 'v1', level_id: 7}, opts[:metadata])
  end

  test 'relays a failed generation with its message and no output' do
    sign_in(@student)
    allow_adaptive_ai(true)

    opts = capture_trace(outcome: 'error', output: nil, usage: nil, errorMessage: 'timed out after 30000ms')

    assert_equal 'error', opts[:outcome]
    assert_nil opts[:output]
    assert_nil opts[:usage]
    assert_equal 'timed out after 30000ms', opts[:error_message]
  end

  test 'cuts an oversized prompt rather than refusing it' do
    sign_in(@student)
    allow_adaptive_ai(true)

    opts = capture_trace(prompt: 'x' * (AdaptiveTracesController::MAX_TEXT_LENGTH + 10))

    assert_response :success
    assert opts[:input].end_with?('[truncated]')
    assert opts[:input].length < AdaptiveTracesController::MAX_TEXT_LENGTH + 20
  end

  test 'rejects a malformed trace id, name, outcome or timestamp' do
    sign_in(@student)
    allow_adaptive_ai(true)
    LangfuseHelper.expects(:trace_adaptive_generation).never

    {traceId: 'nope', traceName: 'other', outcome: 'maybe', startedAt: 'yesterday'}.each do |key, value|
      post :create, params: @params.merge(key => value), as: :json
      assert_response :bad_request, "expected #{key}=#{value} to be rejected"
    end
  end
end

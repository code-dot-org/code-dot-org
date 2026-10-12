require 'test_helper'

class LangfuseHelperTest < ActiveSupport::TestCase
  def default_args
    {
      trace_id: 'ab' * 16,
      trace_name: 'adaptive-instructions',
      user_id: 42,
      model: 'gemini-2.5-flash',
      input: 'the prompt',
      output: {'instructions' => 'Do this.'},
      outcome: 'success',
      error_message: nil,
      usage: {input: 10, output: 2, total: 12},
      metadata: {step_id: 's'},
      start_time: Time.utc(2026, 1, 1, 0, 0, 0),
      end_time: Time.utc(2026, 1, 1, 0, 0, 2),
    }
  end

  def capture_trace(**overrides)
    captured = nil
    LangfuseClientHelper::Client.any_instance.expects(:create_trace_and_generation).with do |opts|
      captured = opts
      true
    end
    LangfuseHelper.trace_adaptive_generation(**default_args.merge(overrides))
    captured
  end

  test 'adaptive trace goes to the adaptive-learning project' do
    CDO.stubs(:adaptive_langfuse_secret_key).returns('sk-adaptive')
    CDO.stubs(:adaptive_langfuse_public_key).returns('pk-adaptive')
    LangfuseClientHelper::Client.expects(:new).with('sk-adaptive', 'pk-adaptive').returns(stub(create_trace_and_generation: nil))

    LangfuseHelper.trace_adaptive_generation(**default_args)
  end

  test 'adaptive trace passes the trace id through and tags by outcome' do
    opts = capture_trace

    assert_equal 'ab' * 16, opts[:trace_id]
    assert_equal 'adaptive-instructions', opts[:trace_name]
    assert_equal 'llm-call', opts[:generation_name]
    assert_equal '42', opts[:user_id]
    assert_equal 'the prompt', opts[:input]
    assert_equal({'instructions' => 'Do this.'}, opts[:output])
    assert_equal %w[adaptive-instructions adaptive success], opts[:tags]
    assert_equal({step_id: 's', outcome: 'success'}, opts[:metadata])
    assert_nil opts[:level]
    assert_nil opts[:status_message]
  end

  test 'adaptive trace marks a failed generation as an error observation' do
    opts = capture_trace(outcome: 'error', output: nil, usage: nil, error_message: 'timed out')

    assert_equal 'ERROR', opts[:level]
    assert_equal 'timed out', opts[:status_message]
    assert_equal %w[adaptive-instructions adaptive error], opts[:tags]
    assert_equal 'error', opts[:metadata][:outcome]
  end

  test 'adaptive trace swallows client failures' do
    LangfuseClientHelper::Client.any_instance.stubs(:create_trace_and_generation).raises(StandardError, 'down')
    Rails.logger.expects(:warn).with(regexp_matches(/trace_adaptive_generation failed: down/))

    assert_nil LangfuseHelper.trace_adaptive_generation(**default_args)
  end
end

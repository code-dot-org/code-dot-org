require "test_helper"

class AichatRequestChatCompletionJobTest < ActiveJob::TestCase
  setup do
    @locale = 'en'
    @student = create :student
    @model_customizations = {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"}
    @new_message = {chatMessageText: 'hello', role: 'user', status: 'unknown', timestamp: Time.now.to_i}
    @toxic_response = {
      text: 'toxic',
      blocked_by: 'comprehend',
      details: {
        flagged_segment: 'toxic',
        max_category: {
          score: 0.7,
          name: 'INSULT'
        }
      }
    }
    @test_env = 'unit-test-env'
    @metrics_model_id = 'metrics-test-model-id'
    CDO.stubs(:rack_env).returns(@test_env)

    AichatSafetyHelper.stubs(:find_toxicity).returns(nil)
  end

  test 'execution status is set to QUEUED before perform' do
    request = create :aichat_request
    AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:QUEUED], request.reload.execution_status
  end

  test "execution status is set to USER_PROFANITY if toxicity detected in user input" do
    request = create :aichat_request
    user_message = JSON.parse(request.new_message, symbolize_names: true)[:chatMessageText]
    AichatSafetyHelper.expects(:find_toxicity).with('user', user_message, @locale).returns(@toxic_response)

    perform_enqueued_jobs do
      AichatRequestChatCompletionJob.perform_later(request: request, locale: @locale)
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PROFANITY], request.reload.execution_status
    assert_equal @toxic_response.to_json, request.response
  end

  test "execution status is set to MODEL_PROFANITY if toxicity detected in model output" do
    AichatSafetyHelper.stubs(:find_toxicity).with('user', anything, anything).returns(nil)
    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).returns('response')
    AichatSafetyHelper.stubs(:find_toxicity).with('assistant', anything, anything).returns(@toxic_response)

    request = create :aichat_request

    perform_enqueued_jobs do
      AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PROFANITY], request.reload.execution_status
    assert_equal @toxic_response.to_json, request.response
  end

  test 'execution status is set to SUCCESS if no profanity is detected' do
    model_response = 'response'
    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).returns(model_response)

    request = create :aichat_request
    perform_enqueued_jobs do
      AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS], request.reload.execution_status
    assert_equal model_response, request.response
  end

  test 'execution status is set to FAILURE and an exception is raised if an unexpected error occurs' do
    error_message = 'error'
    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).raises(StandardError.new(error_message))

    request = create :aichat_request
    exception = assert_raises(StandardError) do
      AichatRequestChatCompletionJob.perform_now(request: request, locale: 'en')
    end

    assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:FAILURE], request.reload.execution_status
    assert request.response.include?(error_message)
    assert exception.message.include?(error_message)
    assert exception.message.include?(request.to_json)
  end

  test 'execution status is set to USER_INPUT_TOO_LARGE and an exception is raised if the input validation error occurs' do
    [
      'Input validation error: `inputs` must have less than 3000 tokens',
      'Input validation error: `inputs` tokens + `max_new_tokens` must be <= 4096.'
    ].each do |error_message|
      AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).raises(Aws::SageMakerRuntime::Errors::ModelError.new(nil, error_message))

      request = create :aichat_request
      perform_enqueued_jobs do
        AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
      end

      assert_equal SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_INPUT_TOO_LARGE], request.reload.execution_status
      assert request.response.include?(error_message)
    end
  end

  test 'reports metrics for successful job' do
    customizations = {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test", selectedModelId: @metrics_model_id}.to_json
    request = create :aichat_request, model_customizations: customizations

    reported_metrics = []

    Cdo::Metrics.stubs(:push)
    Cdo::Metrics.expects(:push).with do |namespace, metrics|
      if namespace == AichatRequestChatCompletionJob::METRICS_NAMESPACE
        reported_metrics << metrics
      end
    end

    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).returns('response')

    perform_enqueued_jobs do
      AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')
    end

    # Verify three calls to Cdo::Metrics.push
    assert_equal 3, reported_metrics.length
    # Verify job start metric
    job_start_metrics = reported_metrics[0]
    assert_equal 1, job_start_metrics.length

    job_start_metric = job_start_metrics.first
    verify_common_metric_properties(job_start_metric)
    assert_equal "#{AichatRequestChatCompletionJob.name}.Start", job_start_metric[:metric_name]
    assert_equal 1, job_start_metric[:value]
    assert_equal 'Count', job_start_metric[:unit]
    assert_equal 2, job_start_metric[:dimensions].length

    # Verify job finish metrics
    job_finish_metrics = reported_metrics[1]
    assert_equal 1, job_finish_metrics.length

    finish_metric = job_finish_metrics[0]
    verify_common_metric_properties(finish_metric)
    assert_equal "#{AichatRequestChatCompletionJob.name}.Finish", finish_metric[:metric_name]
    assert_equal 1, finish_metric[:value]
    assert_equal 'Count', finish_metric[:unit]
    assert_equal 3, finish_metric[:dimensions].length
    assert_equal 'SUCCESS', finish_metric[:dimensions][2][:value]

    job_execution_metrics = reported_metrics[2]
    assert_equal 1, job_execution_metrics.length
    execution_time_metric = job_execution_metrics[0]
    verify_common_metric_properties(execution_time_metric)
    assert_equal "#{AichatRequestChatCompletionJob.name}.ExecutionTime", execution_time_metric[:metric_name]
    assert execution_time_metric[:value].is_a?(Numeric)
    assert_equal 'Seconds', execution_time_metric[:unit]
  end

  test 'reports metrics for failed job' do
    customizations = {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test", selectedModelId: @metrics_model_id}.to_json
    request = create :aichat_request, model_customizations: customizations

    reported_metrics = []

    Cdo::Metrics.stubs(:push)
    Cdo::Metrics.expects(:push).with do |namespace, metrics|
      if namespace == AichatRequestChatCompletionJob::METRICS_NAMESPACE
        reported_metrics << metrics
      end
    end

    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).raises(StandardError.new('error'))

    assert_raises(StandardError) do
      AichatRequestChatCompletionJob.perform_now(request: request, locale: 'en')
    end

    # Verify three calls to Cdo::Metrics.push
    assert_equal 3, reported_metrics.length

    # Verify job finish metric
    job_finish_metrics = reported_metrics[1]
    assert_equal 1, job_finish_metrics.length

    finish_metric = job_finish_metrics[0]
    verify_common_metric_properties(finish_metric)
    assert_equal "#{AichatRequestChatCompletionJob.name}.Finish", finish_metric[:metric_name]
    assert_equal 1, finish_metric[:value]
    assert_equal 'Count', finish_metric[:unit]
    assert_equal 3, finish_metric[:dimensions].length
    assert_equal 'FAILURE', finish_metric[:dimensions][2][:value]
  end

  def verify_common_metric_properties(metric)
    assert metric[:timestamp].is_a?(Time)
    assert_equal 'Environment', metric[:dimensions][0][:name]
    assert_equal @test_env, metric[:dimensions][0][:value]
    assert_equal 'ModelId', metric[:dimensions][1][:name]
    assert_equal @metrics_model_id, metric[:dimensions][1][:value]
  end
end

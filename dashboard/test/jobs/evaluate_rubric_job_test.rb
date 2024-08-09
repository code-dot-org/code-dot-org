require "test_helper"
require 'testing/includes_metrics'

class EvaluateRubricJobTest < ActiveJob::TestCase
  setup do
    @student = create :student
    @teacher = create :teacher
    @script_level = create :script_level
    assert_equal @script_level.script, @script_level.lesson.script

    @fake_ip = '127.0.0.1'
    @storage_id = create_storage_id_for_user(@student.id)

    @rubric = create :rubric, level: @script_level.level, lesson: @script_level.lesson
    create :learning_goal, rubric: @rubric, learning_goal: 'learning-goal-1'
    create :learning_goal, rubric: @rubric, learning_goal: 'learning-goal-2'
    create :learning_goal, rubric: @rubric, learning_goal: 'learning-goal-3'
    assert_equal 3, @rubric.learning_goals.count

    # Don't actually talk to S3 when running SourceBucket.new
    AWS::S3.stubs :create_client

    CDO.stubs(:openai_evaluate_rubric_api_key).returns('fake-api-key')
  end

  test "job succeeds on ai-enabled level with tsv response type" do
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    stub_project_source_data(channel_id)

    stub_lesson_s3_data

    stub_get_openai_evaluations

    # run the job
    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later(user_id: @student.id, requester_id: @student.id, script_level_id: @script_level.id)
    end

    assert_equal SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:SUCCESS], RubricAiEvaluation.where(user_id: @student.id).first.status
    verify_stored_ai_evaluations(channel_id: channel_id, rubric: @rubric, user: @student)
  end

  test "job succeeds on ai-enabled level with json response type" do
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    stub_project_source_data(channel_id)

    stub_lesson_s3_data(response_type: 'json')

    stub_get_openai_evaluations(response_type: 'json')

    # run the job
    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later(user_id: @student.id, requester_id: @student.id, script_level_id: @script_level.id)
    end

    assert_equal SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:SUCCESS], RubricAiEvaluation.where(user_id: @student.id).first.status
    verify_stored_ai_evaluations(channel_id: channel_id, rubric: @rubric, user: @student)
  end

  test "job succeeds on ai-enabled level without confidence exact json" do
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    stub_project_source_data(channel_id)

    stub_lesson_s3_data(response_type: 'json', include_exact: false)

    stub_get_openai_evaluations(response_type: 'json')

    # run the job
    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later(user_id: @student.id, requester_id: @student.id, script_level_id: @script_level.id)
    end

    assert_equal SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:SUCCESS], RubricAiEvaluation.where(user_id: @student.id).first.status
    verify_stored_ai_evaluations(channel_id: channel_id, rubric: @rubric, user: @student, include_exact_confidence: false)
  end

  test "job fails on non-ai level" do
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns(nil)

    # create a project (we still build a rubric evaluation record first, which means that check is first)
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    stub_project_source_data(channel_id)

    exception = assert_raises RuntimeError do
      EvaluateRubricJob.perform_now(user_id: @student.id, requester_id: @student.id, script_level_id: @script_level.id)
    end
    assert_includes exception.message, 'lesson_s3_name not found'
  end

  test "job fails if channel token does not exist" do
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    exception = assert_raises RuntimeError do
      EvaluateRubricJob.perform_now(user_id: @student.id, requester_id: @student.id, script_level_id: @script_level.id)
    end
    assert_includes exception.message, 'channel token not found'
  end

  test "job fails if project source code not found" do
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    SourceBucket.any_instance.stubs(:get).with(channel_id, "main.json").returns({status: 'NOT_FOUND'})

    exception = assert_raises RuntimeError do
      EvaluateRubricJob.perform_now(user_id: @student.id, requester_id: @student.id, script_level_id: @script_level.id)
    end
    assert_includes exception.message, 'main.json not found'
    assert_equal SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:FAILURE], RubricAiEvaluation.where(user_id: @student.id).first.status
  end

  test "job fails if rubric not found" do
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')
    @rubric.learning_goals.each do |lg|
      LearningGoalAiEvaluation.where(learning_goal_id: lg.id).map(&:destroy)
    end
    @rubric.destroy

    # Create the evaluation record
    rubric_ai_evaluation = create(
      :rubric_ai_evaluation,
      user: @student,
      requester: @student,
      status: 0
    )

    exception = assert_raises ActiveRecord::RecordNotFound do
      EvaluateRubricJob.new.perform(user_id: @student.id, requester_id: @student.id, script_level_id: @script_level.id, rubric_ai_evaluation_id: rubric_ai_evaluation.id)
    end
    assert_includes exception.message, "Couldn't find Rubric"
  end

  test "job fails when the code contains profanity" do
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    violating_code = 'damn'

    stub_project_source_data(channel_id, code: violating_code)

    stub_lesson_s3_data

    stub_get_openai_evaluations(code: violating_code)

    ShareFiltering.stubs(:find_share_failure).with(violating_code, 'en', exceptions: true).raises(
      ProfanityFilterException.new(
        "Profanity Failure",
        ShareFailure.new('profanity', 'damn')
      )
    )

    # run the job
    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later(user_id: @student.id, requester_id: @student.id, script_level_id: @script_level.id)
    end

    assert_equal SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:PROFANITY_VIOLATION], RubricAiEvaluation.where(user_id: @student.id).first.status
  end

  test "job fails when the code contains PII violations" do
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    violating_code = 'My phone number is 123-456-7890!'

    stub_project_source_data(channel_id, code: violating_code)

    stub_lesson_s3_data

    stub_get_openai_evaluations(code: violating_code)

    ShareFiltering.stubs(:find_share_failure).with(violating_code, 'en', exceptions: true).raises(
      PIIFilterException.new(
        "PII Failure",
        ShareFailure.new('email', '123-456-7890')
      )
    )

    # run the job
    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later(user_id: @student.id, requester_id: @student.id, script_level_id: @script_level.id)
    end

    assert_equal SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:PII_VIOLATION], RubricAiEvaluation.where(user_id: @student.id).first.status
  end

  test "job is retried when the proxy server returns a 429" do
    # Perform an otherwise successful run
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # Create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    stub_project_source_data(channel_id)

    stub_lesson_s3_data

    stub_get_openai_evaluations(status: 429)

    # The superclass, ApplicationJob, logs metrics around all jobs.
    # Those calls must be stubbed to test metrics for this job.
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      anything
    )

    # ensure RateLimit metric is logged
    Cdo::Metrics.expects(:push).with(
      AiRubricMetrics::AI_RUBRIC_METRICS_NAMESPACE,
      all_of(
        includes_metrics(RateLimit: 1),
        includes_dimensions(:RateLimit, Environment: CDO.rack_env)
      )
    )

    # ensure firehose event is logged
    FirehoseClient.instance.expects(:put_record).with do |stream, data|
      data[:study] == AiRubricMetrics::AI_RUBRICS_FIREHOSE_STUDY &&
        data[:event] == 'rate-limit' &&
        JSON.parse(data[:data_json])['agent'].nil? &&
        stream == :analysis
    end

    # Run the job (and track attempts)
    assert_performed_jobs EvaluateRubricJob::ATTEMPTS_ON_RATE_LIMIT do
      perform_enqueued_jobs do
        EvaluateRubricJob.perform_later(
          user_id: @student.id,
          requester_id: @student.id,
          script_level_id: @script_level.id
        )
      end
    end
  end

  test "job is retried when the proxy server times out" do
    # Perform an otherwise successful run
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # Create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    stub_project_source_data(channel_id)

    stub_lesson_s3_data

    stub_get_openai_evaluations(raises: Net::ReadTimeout)

    # The superclass, ApplicationJob, logs metrics around all jobs.
    # Those calls must be stubbed to test metrics for this job.
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      anything
    )

    # ensure TimeoutError metric is logged
    Cdo::Metrics.expects(:push).with(
      AiRubricMetrics::AI_RUBRIC_METRICS_NAMESPACE,
      all_of(
        includes_metrics(TimeoutError: 1),
        includes_dimensions(:TimeoutError, Environment: CDO.rack_env)
      )
    )

    # ensure firehose event is logged
    FirehoseClient.instance.expects(:put_record).with do |stream, data|
      data[:study] == AiRubricMetrics::AI_RUBRICS_FIREHOSE_STUDY &&
        data[:event] == 'timeout-error' &&
        JSON.parse(data[:data_json])['agent'].nil? &&
        stream == :analysis
    end

    # Run the job (and track attempts)
    assert_performed_jobs EvaluateRubricJob::ATTEMPTS_ON_TIMEOUT_ERROR do
      perform_enqueued_jobs do
        EvaluateRubricJob.perform_later(
          user_id: @student.id,
          requester_id: @student.id,
          script_level_id: @script_level.id
        )
      end
    end
  end

  test 'job is retried when proxy server returns 503' do
    # Perform an otherwise successful run
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # Create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    stub_project_source_data(channel_id)

    stub_lesson_s3_data

    # the stub response currently returns a json object, so just make sure that
    # response contains "openai" rather than going through the trouble of composing
    # a more accurate response representing a 503 error.
    stub_get_openai_evaluations(status: 503, message: 'OpenAI')

    # The superclass, ApplicationJob, logs metrics around all jobs.
    # Those calls must be stubbed to test metrics for this job.
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      anything
    )

    # ensure ServiceUnavailable metric is logged
    Cdo::Metrics.expects(:push).with(
      AiRubricMetrics::AI_RUBRIC_METRICS_NAMESPACE,
      all_of(
        includes_metrics(ServiceUnavailable: 1),
        includes_dimensions(:ServiceUnavailable, Environment: CDO.rack_env, Agent: 'openai')
      )
    )

    # ensure firehose event is logged
    FirehoseClient.instance.expects(:put_record).with do |stream, data|
      data[:study] == AiRubricMetrics::AI_RUBRICS_FIREHOSE_STUDY &&
        data[:event] == 'service-unavailable' &&
        JSON.parse(data[:data_json])['agent'] == 'openai' &&
        stream == :analysis
    end

    # Run the job (and track attempts)
    assert_performed_jobs EvaluateRubricJob::ATTEMPTS_ON_SERVICE_UNAVAILABLE do
      perform_enqueued_jobs do
        EvaluateRubricJob.perform_later(
          user_id: @student.id,
          requester_id: @student.id,
          script_level_id: @script_level.id
        )
      end
    end
  end

  test 'job is retried when proxy server returns 504' do
    # Perform an otherwise successful run
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # Create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    stub_project_source_data(channel_id)

    stub_lesson_s3_data

    # the stub response currently returns a json object, so just make sure that
    # response contains "openai" rather than going through the trouble of composing
    # a more accurate response representing a 504 error.
    stub_get_openai_evaluations(status: 504, message: 'OpenAI')

    # The superclass, ApplicationJob, logs metrics around all jobs.
    # Those calls must be stubbed to test metrics for this job.
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      anything
    )

    # ensure GatewayTimeout metric is logged
    Cdo::Metrics.expects(:push).with(
      AiRubricMetrics::AI_RUBRIC_METRICS_NAMESPACE,
      all_of(
        includes_metrics(GatewayTimeout: 1),
        includes_dimensions(:GatewayTimeout, Environment: CDO.rack_env, Agent: 'openai')
      )
    )

    # ensure firehose event is logged
    FirehoseClient.instance.expects(:put_record).with do |stream, data|
      data[:study] == AiRubricMetrics::AI_RUBRICS_FIREHOSE_STUDY &&
        data[:event] == 'gateway-timeout' &&
        JSON.parse(data[:data_json])['agent'] == 'openai' &&
        stream == :analysis
    end

    # Run the job (and track attempts)
    assert_performed_jobs EvaluateRubricJob::ATTEMPTS_ON_GATEWAY_TIMEOUT do
      perform_enqueued_jobs do
        EvaluateRubricJob.perform_later(
          user_id: @student.id,
          requester_id: @student.id,
          script_level_id: @script_level.id
        )
      end
    end
  end

  test "job records REQUEST_TOO_LARGE on http status 413" do
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    stub_project_source_data(channel_id)

    stub_lesson_s3_data(response_type: 'json')

    stub_get_openai_evaluations(response_type: 'json', status: 413)

    # run the job
    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later(user_id: @student.id, requester_id: @student.id, script_level_id: @script_level.id)
    end

    assert_equal SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:REQUEST_TOO_LARGE], RubricAiEvaluation.where(user_id: @student.id).first.status
  end

  test "metrics for tokens used are logged" do
    # Perform an otherwise successful run
    AiRubricConfig.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # Create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    stub_project_source_data(channel_id)

    stub_lesson_s3_data

    stub_get_openai_evaluations(metadata: {
                                  'agent' => 'openai',
                                  'usage' => {
                                    'total_tokens' => 123,
                                    'completion_tokens' => 100,
                                    'prompt_tokens' => 23,
                                  },
                                }
    )

    # The superclass, ApplicationJob, logs metrics around all jobs.
    # Those calls must be stubbed to test metrics for this job.
    Cdo::Metrics.stubs(:push).with(
      ApplicationJob::METRICS_NAMESPACE,
      anything
    )

    # Expect metrics to be logged for the AI evaluation
    Cdo::Metrics.expects(:push).with(
      AiRubricMetrics::AI_RUBRIC_METRICS_NAMESPACE,
      all_of(
        includes_metrics(TotalTokens: 123),
        includes_dimensions(:TotalTokens, Environment: CDO.rack_env, Agent: 'openai')
      )
    )

    Cdo::Metrics.expects(:push).with(
      AiRubricMetrics::AI_RUBRIC_METRICS_NAMESPACE,
      all_of(
        includes_metrics(CompletionTokens: 100),
        includes_dimensions(:CompletionTokens, Environment: CDO.rack_env, Agent: 'openai')
      )
    )

    Cdo::Metrics.expects(:push).with(
      AiRubricMetrics::AI_RUBRIC_METRICS_NAMESPACE,
      all_of(
        includes_metrics(PromptTokens: 23),
        includes_dimensions(:PromptTokens, Environment: CDO.rack_env, Agent: 'openai')
      )
    )

    # Run the job (and track attempts)
    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later(
        user_id: @student.id,
        requester_id: @student.id,
        script_level_id: @script_level.id
      )
    end
  end

  test 'job is not performed when student limits are exceeded' do
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    # create more existing RubricAiEvaluation records than are allowed
    existing_job_count = SharedConstants::RUBRIC_AI_EVALUATION_LIMITS[:STUDENT_LIMIT] + 1
    existing_job_count.times do
      create(
        :rubric_ai_evaluation, user: @student, requester: @student, rubric: @rubric,
        status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:SUCCESS], project_id: channel_id
      )
    end
    assert_equal existing_job_count, RubricAiEvaluation.where(user_id: @student.id).count
    assert_equal SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:SUCCESS], RubricAiEvaluation.where(user_id: @student.id).last.status

    # make sure we do not try to make an API call
    HTTParty.stubs(:post).never

    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later(user_id: @student.id, requester_id: @student.id, script_level_id: @script_level.id)
    end

    assert_equal SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:STUDENT_LIMIT_EXCEEDED], RubricAiEvaluation.where(user_id: @student.id).last.status
  end

  test 'job is not performed when teacher limits are exceeded' do
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    # create more existing RubricAiEvaluation records than are allowed
    existing_job_count = SharedConstants::RUBRIC_AI_EVALUATION_LIMITS[:TEACHER_LIMIT] + 1
    existing_job_count.times do
      create(
        :rubric_ai_evaluation, user: @student, requester: @teacher, rubric: @rubric,
        status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:SUCCESS], project_id: channel_id
      )
    end
    assert_equal existing_job_count, RubricAiEvaluation.where(user: @student).count
    last_eval = RubricAiEvaluation.where(user: @student, requester: @teacher).last
    assert_equal SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:SUCCESS], last_eval.status
    assert_equal @teacher.id, last_eval.requester_id

    # make sure we do not try to make an API call
    HTTParty.stubs(:post).never

    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later(user_id: @student.id, requester_id: @teacher.id, script_level_id: @script_level.id)
    end

    assert_equal SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:TEACHER_LIMIT_EXCEEDED], RubricAiEvaluation.where(user_id: @student.id).last.status
  end

  # stub out the calls to fetch project data from S3. Because the call to S3
  # is deep inside SourceBucket, we stub out the entire SourceBucket class
  # rather than stubbing the S3 calls directly.
  private def stub_project_source_data(channel_id, code: 'fake-code', version_id: 'fake-version-id')
    fake_main_json = {source: code}.to_json
    fake_source_data = {
      status: 'FOUND',
      body: StringIO.new(fake_main_json),
      version_id: version_id
    }
    SourceBucket.any_instance.stubs(:get).with(channel_id, "main.json").returns(fake_source_data)
  end

  # stub out the s3 calls made from the job via read_file_from_s3 and read_examples.
  private def stub_lesson_s3_data(response_type: 'tsv', include_exact: true)
    raise "invalid response type #{response_type}" unless ['tsv', 'json'].include? response_type
    s3_client = Aws::S3::Client.new(stub_responses: true)
    fake_confidence_levels = {
      'learning-goal-1': "MEDIUM",
      'learning-goal-2': "MEDIUM",
      'learning-goal-3': "MEDIUM",
    }.to_json
    exact_confidence_hash = {
      'Extensive Evidence': 'LOW',
      'Convincing Evidence': 'LOW',
      'Limited Evidence': 'LOW',
      'No Evidence': 'LOW',
    }
    fake_confidence_levels_exact = {
      'learning-goal-1': exact_confidence_hash,
      'learning-goal-2': exact_confidence_hash,
      'learning-goal-3': exact_confidence_hash,
    }.to_json
    fake_params = {
      'model' => 'gpt-4-0613',
      'remove-comments' => '1',
      'num-responses' => '3',
      'num-passing-labels' => '2',
      'temperature' => '0.2',
      'response-type' => response_type,
    }.to_json
    path_prefix = AiRubricConfig::S3_AI_RELEASE_PATH
    bucket = {
      "#{path_prefix}fake-lesson-s3-name/system_prompt.txt" => 'fake-system-prompt',
      "#{path_prefix}fake-lesson-s3-name/standard_rubric.csv" => 'fake-standard-rubric',
      "#{path_prefix}fake-lesson-s3-name/params.json" => fake_params,
      "#{path_prefix}fake-lesson-s3-name/confidence.json" => fake_confidence_levels,
      "#{path_prefix}fake-lesson-s3-name/examples/1.js" => 'fake-code-1',
      "#{path_prefix}fake-lesson-s3-name/examples/1.#{response_type}" => 'fake-response-1',
      "#{path_prefix}fake-lesson-s3-name/examples/2.js" => 'fake-code-2',
      "#{path_prefix}fake-lesson-s3-name/examples/2.#{response_type}" => 'fake-response-2',
    }
    if include_exact
      bucket["#{path_prefix}fake-lesson-s3-name/confidence-exact.json"] = fake_confidence_levels_exact
    end

    s3_client.stub_responses(
      :get_object,
      ->(context) do
        key = context.params[:key]
        obj = bucket[key]
        raise AiRubricConfig::StubNoSuchKey.new(key) unless obj
        {body: StringIO.new(obj)}
      end
    )

    s3_client.stub_responses(
      :list_objects_v2,
      {
        contents: bucket.keys.map {|key| {key: key}}
      }
    )

    AiRubricConfig.stubs(:s3_client).returns(s3_client)
  end

  private def stub_get_openai_evaluations(code: 'fake-code', status: 200, raises: nil, metadata: {}, response_type: 'tsv', message: 'message')
    raise "invalid response type #{response_type}" unless ['tsv', 'json'].include? response_type
    expected_examples = [
      ['fake-code-1', 'fake-response-1'],
      ['fake-code-2', 'fake-response-2']
    ]
    expected_form_data = {
      "model" => "gpt-4-0613",
      "remove-comments" => "1",
      "num-responses" => "3",
      "num-passing-labels" => "2",
      "temperature" => "0.2",
      'response-type' => response_type,
      "code" => code,
      "prompt" => 'fake-system-prompt',
      "rubric" => 'fake-standard-rubric',
      "examples" => expected_examples.to_json,
      'api-key' => 'fake-api-key',
    }
    fake_ai_evaluations = [
      {
        'Key Concept' => 'learning-goal-1',
        'Label' => 'Extensive Evidence'
      },
      {
        'Key Concept' => 'learning-goal-2',
        'Label' => 'Extensive Evidence'
      },
      {
        'Key Concept' => 'learning-goal-3',
        'Label' => 'Extensive Evidence'
      }
    ]
    ai_proxy_origin = 'http://fake-ai-proxy-origin'
    CDO.stubs(:ai_proxy_origin).returns(ai_proxy_origin)
    uri = URI.parse("#{ai_proxy_origin}/assessment")

    request = stub(
      uri: uri
    )
    response = stub(
      body: {metadata: metadata, data: fake_ai_evaluations}.to_json,
      code: status,
      message: message,
      request: request,
      success?: status == 200
    )
    response.stubs(:is_a?).with(HTTParty::Response).returns(true)

    post_stub = HTTParty.stubs(:post).with(
      uri,
      body: URI.encode_www_form(expected_form_data),
      headers: {'Content-Type' => 'application/x-www-form-urlencoded', 'Authorization' => CDO.aiproxy_api_key},
      timeout: EvaluateRubricJob::AIPROXY_API_TIMEOUT
    )

    if raises
      post_stub.raises(raises)
    else
      post_stub.returns(response)
    end
  end

  # verify the job wrote the expected LearningGoalAiEvaluations to the database
  #
  # @param channel_id [String]
  # @param rubric [Rubric]
  # @param user [User]
  # @param expected_understanding [Integer]
  # @param version_id [String]
  # @param include_exact_confidence [Boolean] whether to expect exact-match
  #   confidence levels to be present in the database
  private def verify_stored_ai_evaluations(
    channel_id:,
    rubric:,
    user:,
    expected_understanding: SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.EXTENSIVE,
    version_id: 'fake-version-id',
    include_exact_confidence: true
  )
    _owner_id, project_id = storage_decrypt_channel_id(channel_id)
    rubric_ai_eval = RubricAiEvaluation.where(user_id: user.id).order(updated_at: :desc).first
    assert_equal project_id, rubric_ai_eval.project_id
    assert_equal version_id, rubric_ai_eval.project_version
    rubric.learning_goals.each do |learning_goal|
      ai_eval = rubric_ai_eval.learning_goal_ai_evaluations.find_by(learning_goal_id: learning_goal.id)
      assert_equal expected_understanding, ai_eval.understanding
      assert_equal LearningGoalAiEvaluation::AI_CONFIDENCE_LEVELS[:MEDIUM], ai_eval.ai_confidence
      expected_confidence = include_exact_confidence ? LearningGoalAiEvaluation::AI_CONFIDENCE_LEVELS[:LOW] : nil
      assert_equal expected_confidence, ai_eval.ai_confidence_exact_match
    end
  end
end

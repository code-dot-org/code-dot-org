# Sending token usage to CloudWatch
require 'cdo/aws/metrics'
require 'csv'

class EvaluateRubricJob < ApplicationJob
  S3_AI_BUCKET = 'cdo-ai'.freeze

  # The path to the release directory in S3 which contains the AI rubric evaluation config.
  # When launching AI config changes, this path should be updated to point to the new release.
  #
  # Basic validation of the new AI config is done by UI tests, or can be done locally
  # by running `EvaluateRubricJob.new.validate_ai_config` from the rails console.
  S3_AI_RELEASE_PATH = 'teaching_assistant/releases/2024-04-30-confidence-autogen-turbo/'.freeze

  STUB_AI_PROXY_PATH = '/api/test/ai_proxy'.freeze

  # 2D Map from unit name and level name, to the name of the lesson files within
  # the release dir in S3 which will be used for AI evaluation.
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME = {
    'csd3-2023' => {
      'CSD U3 Sprites scene challenge_2023' => 'csd3-2023-L11',
      'CSD web project animated review_2023' => 'csd3-2023-L14',
      'CSD U3 Interactive Card Final_2023' => 'csd3-2023-L18',
      'CSD games sidescroll review_2023' => 'csd3-2023-L21',
      'CSD U3 collisions flyman bounceOff_2023' => 'csd3-2023-L24',
      'CSD games project review_2023' => 'csd3-2023-L28',
    },
    'allthethings' => {
      'CSD U3 Sprites scene challenge_allthethings' => 'allthethings-L48',
    },
  }
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME['interactive-games-animations-2023'] = UNIT_AND_LEVEL_TO_LESSON_S3_NAME['csd3-2023']
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME['focus-on-creativity3-2023'] = UNIT_AND_LEVEL_TO_LESSON_S3_NAME['csd3-2023']
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME['focus-on-coding3-2023'] = UNIT_AND_LEVEL_TO_LESSON_S3_NAME['csd3-2023']
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME.freeze

  AIPROXY_API_TIMEOUT = 165

  # This is raised if there is any raised error due to a rate limit, e.g. a 429
  # received from the aiproxy service.
  class TooManyRequestsError < StandardError
    attr_reader :response

    # Creates a TooManyRequestsError for the given response.
    #
    # @param [HTTParty::Response] response The HTTP response that exhibits this error.
    def initialize(response)
      @response = response

      super("Too many requests for #{response.request.uri}")
    end
  end

  # This is raised if the request is too large for the openai, indicating that
  # the code was too long relative to the LLM's context window.
  class RequestTooLargeError < StandardError
    attr_reader :response

    # Creates a RequestTooLargeError for the given response.
    #
    # @param [HTTParty::Response] response The HTTP response that exhibits this error.
    def initialize(response)
      @response = response

      super("Request too large for #{response.request.uri}: #{response.code} #{response.message} #{response.body}")
    end
  end

  class ServiceUnavailableError < StandardError
    attr_reader :response

    # Creates a ServiceUnavailableError for the given response.
    #
    # @param [HTTParty::Response] response The HTTP response that exhibits this error.
    def initialize(response)
      @response = response

      super("Service unavailable for #{response.request.uri}: #{response.code} #{response.message} #{response.body}")
    end
  end

  class GatewayTimeoutError < StandardError
    attr_reader :response

    # Creates a GatewayTimeoutError for the given response.
    #
    # @param [HTTParty::Response] response The HTTP response that exhibits this error.
    def initialize(response)
      @response = response

      super("Gateway Timeout for #{response.request.uri}: #{response.code} #{response.message} #{response.body}")
    end
  end

  # For testing purposes, we can raise this error to simulate a missing key
  class StubNoSuchKey < StandardError
  end

  # The CloudWatch metric namespace
  AI_RUBRIC_METRICS_NAMESPACE = 'AiRubric'.freeze

  # The firehose study name
  AI_RUBRICS_FIREHOSE_STUDY = 'ai-rubrics'.freeze

  # Write out metrics reflected in the response to CloudWatch
  #
  # Currently, this keeps track of a curated set of metrics returned
  # within the 'metadata.usage' field of the returned response from
  # the AI proxy service.
  #
  # @param [Hash] response The parsed JSON response from the AI proxy.
  def self.log_token_metrics(response)
    # Record the metadata
    # The aiproxy service will report the usage in the metadata via:
    # { metadata: { agent: 'openai', usage: { total_tokens: 1234, prompt_tokens: 432, completion_tokens: 802 } } }
    [:TotalTokens, :PromptTokens, :CompletionTokens].each do |name|
      # Send a metric to the AIRubric namespace under categories for both the
      # service used (openai, etc) and the current environment.
      tokens = response.dig('metadata', 'usage', name.to_s.underscore)
      next if tokens.nil?
      agent = response.dig('metadata', 'agent') || 'unknown'
      log_metric(metric_name: name, agent: agent, value: tokens)
    end
  end

  # Ensure that the RubricAiEvaluation exists as an argument to the job
  private def pass_in_or_create_rubric_ai_evaluation(job)
    # Get the first argument to perform() which is the hash of named arguments
    options = job.arguments.first

    # Get the level containing the rubric
    script_level = ScriptLevel.find(options[:script_level_id])

    # Will raise an exception if the rubric does not exist
    rubric = Rubric.find_by!(lesson_id: script_level.lesson.id, level_id: script_level.level.id)

    user = User.find(options[:user_id])
    channel_id = get_channel_id(user, script_level)
    _owner_id, project_id = storage_decrypt_channel_id(channel_id)

    # Create a queued record of this work request (if none were given)
    rubric_ai_evaluation_id = options[:rubric_ai_evaluation_id]
    rubric_ai_evaluation = (rubric_ai_evaluation_id && RubricAiEvaluation.find(rubric_ai_evaluation_id)) || RubricAiEvaluation.create!(
      user_id: options[:user_id],
      requester_id: options[:requester_id],
      rubric: rubric,
      status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:QUEUED],
      project_id: project_id,
    )

    # Set it back so the job can reference it
    options[:rubric_ai_evaluation_id] = rubric_ai_evaluation.id

    # Return the Rubric
    rubric_ai_evaluation
  end

  before_enqueue do |job|
    rubric_ai_evaluation = pass_in_or_create_rubric_ai_evaluation(job)
    rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:QUEUED]
    rubric_ai_evaluation.save!
  end

  before_perform do |job|
    rubric_ai_evaluation = pass_in_or_create_rubric_ai_evaluation(job)
    rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:RUNNING]
    rubric_ai_evaluation.save!
  end

  # Write out any general error status for any exception
  rescue_from(StandardError) do |exception|
    if rack_env?(:development)
      puts "EvaluateRubricJob Error: #{exception.full_message}"
    end

    # Record the failure, if we can
    begin
      rubric_ai_evaluation = pass_in_or_create_rubric_ai_evaluation(self)
      rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:FAILURE]
      rubric_ai_evaluation.save!
    rescue StandardError
      # Ignore cascading errors when the rubric record does not exist
    end

    # Re-raise the original exception to track it elsewhere
    raise exception
  end

  rescue_from(ProfanityFilterException) do |exception|
    if rack_env?(:development)
      puts "EvaluateRubricJob Filter Error: #{exception.full_message} Type: #{exception.share_failure.type}"
    end

    # Record the failure, if we can
    begin
      rubric_ai_evaluation = pass_in_or_create_rubric_ai_evaluation(self)
      rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:PROFANITY_VIOLATION]
      rubric_ai_evaluation.save!
    rescue StandardError
      # Ignore cascading errors when the rubric record does not exist
    end

    # We gracefully just fail, here, and we do not file this exception
  end

  rescue_from(PIIFilterException) do |exception|
    if rack_env?(:development)
      puts "EvaluateRubricJob Filter Error: #{exception.full_message} Type: #{exception.share_failure.type}"
    end

    # Record the failure, if we can
    begin
      rubric_ai_evaluation = pass_in_or_create_rubric_ai_evaluation(self)
      rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:PII_VIOLATION]
      rubric_ai_evaluation.save!
    rescue StandardError
      # Ignore cascading errors when the rubric record does not exist
    end

    # We gracefully just fail, here, and we do not file this exception
  end

  rescue_from(RequestTooLargeError) do |exception|
    if rack_env?(:development)
      puts "EvaluateRubricJob RequestTooLargeError: #{exception.message}"
    end

    # Record the failure mode, so we can show the right message to the teacher
    rubric_ai_evaluation = pass_in_or_create_rubric_ai_evaluation(self)
    rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:REQUEST_TOO_LARGE]
    rubric_ai_evaluation.save!
  end

  ATTEMPTS_ON_RATE_LIMIT = 3

  # Retry on any reported rate limit (429 status). With 3 attempts, 'exponentially_longer' waits 3s, then 18s.
  retry_on TooManyRequestsError, wait: :exponentially_longer, attempts: ATTEMPTS_ON_RATE_LIMIT do |job, error|
    log_metric(metric_name: :RateLimit)
    log_to_firehose(job: job, error: error, event_name: 'rate-limit')
  end

  ATTEMPTS_ON_TIMEOUT_ERROR = 2

  # Retry just once on a timeout. It is likely to timeout again.
  retry_on Net::ReadTimeout, Timeout::Error, wait: 10.seconds, attempts: ATTEMPTS_ON_TIMEOUT_ERROR do |job, error|
    log_metric(metric_name: :TimeoutError)
    log_to_firehose(job: job, error: error, event_name: 'timeout-error')
  end

  ATTEMPTS_ON_SERVICE_UNAVAILABLE = 3

  # Retry on a 503 Service Unavailable error, including those returned by aiproxy
  # when openai returns 500.
  retry_on ServiceUnavailableError, wait: :exponentially_longer, attempts: ATTEMPTS_ON_SERVICE_UNAVAILABLE do |job, error|
    agent = error.message.downcase.include?('openai') ? 'openai' : 'none'
    log_metric(metric_name: :ServiceUnavailable, agent: agent)
    log_to_firehose(job: job, error: error, event_name: 'service-unavailable', agent: agent)
  end

  ATTEMPTS_ON_GATEWAY_TIMEOUT = 3

  # Retry on a 504 Gateway Timeout error, including those returned by aiproxy
  # when openai request times out.
  retry_on GatewayTimeoutError, wait: :exponentially_longer, attempts: ATTEMPTS_ON_GATEWAY_TIMEOUT do |job, error|
    agent = error.message.downcase.include?('openai') ? 'openai' : 'none'
    log_metric(metric_name: :GatewayTimeout, agent: agent)
    log_to_firehose(job: job, error: error, event_name: 'gateway-timeout', agent: agent)
  end

  def self.log_metric(metric_name:, agent: nil, value: 1)
    Cdo::Metrics.push(
      AI_RUBRIC_METRICS_NAMESPACE,
      [
        {
          metric_name: metric_name,
          value: value,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
            {name: 'Agent', value: agent},
          ],
          unit: 'Count'
        }
      ]
    )
  end

  def self.log_to_firehose(job:, error:, event_name:, agent: nil)
    options = job.arguments.first
    script_level = ScriptLevel.find(options[:script_level_id])

    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: AI_RUBRICS_FIREHOSE_STUDY,
        study_group: 'v0',
        event: event_name,
        data_string: "#{error.class.name}: #{error.message}",
        data_json: {
          user_id: options[:user_id],
          requester_id: options[:requester_id],
          script_level_id: options[:script_level_id],
          script_name: script_level.script.name,
          lesson_number: script_level.lesson.relative_position,
          level_name: script_level.level.name,
          agent: agent
        }.to_json
      }
    )
  end

  def perform(user_id:, requester_id:, script_level_id:, rubric_ai_evaluation_id: nil)
    user = User.find(user_id)
    script_level = ScriptLevel.find(script_level_id)
    lesson_s3_name = EvaluateRubricJob.get_lesson_s3_name(script_level)

    # Find the rubric evaluation record (or raise RecordNotFound)
    raise "ERROR: must provide rubric ai evaluation record id" unless rubric_ai_evaluation_id
    rubric_ai_evaluation = RubricAiEvaluation.find(rubric_ai_evaluation_id)

    raise 'CDO.openai_evaluate_rubric_api_key not set' unless CDO.openai_evaluate_rubric_api_key
    raise "lesson_s3_name not found for script_level_id: #{script_level.id}" if lesson_s3_name.blank?

    # Find the rubric (or raise RecordNotFound)
    rubric = Rubric.find_by!(lesson_id: script_level.lesson.id, level_id: script_level.level.id)

    channel_id = get_channel_id(user, script_level)
    code, project_version = read_user_code(channel_id)

    # Check for PII / sharing failures
    # Get the 2-character language code from the user's preferred locale
    locale = (user.locale || 'en')[0...2]
    ShareFiltering.find_share_failure(code, locale, exceptions: true)

    openai_params = get_openai_params(lesson_s3_name, code)
    response = get_openai_evaluations(openai_params)

    # Log tokens and usage information
    EvaluateRubricJob.log_token_metrics(response)

    # Get and validate the response data
    ai_evaluations = response['data']
    validate_evaluations(ai_evaluations, rubric)

    ai_confidence_levels_pass_fail = JSON.parse(read_file_from_s3(lesson_s3_name, 'confidence.json'))
    confidence_exact_json = read_file_from_s3(lesson_s3_name, 'confidence-exact.json', allow_missing: true)
    ai_confidence_levels_exact_match = confidence_exact_json ? JSON.parse(confidence_exact_json) : nil
    merged_evaluations = merge_confidence_levels(ai_evaluations, ai_confidence_levels_pass_fail, ai_confidence_levels_exact_match)

    write_ai_evaluations(user, merged_evaluations, rubric, rubric_ai_evaluation, project_version)
  end

  def self.ai_enabled?(script_level)
    !!get_lesson_s3_name(script_level)
  end

  # returns the path suffix of the location in S3 which contains the config
  # needed to evaluate the rubric for the given script level.
  def self.get_lesson_s3_name(script_level)
    UNIT_AND_LEVEL_TO_LESSON_S3_NAME[script_level&.script&.name].try(:[], script_level&.level&.name)
  end

  # The client for s3 access made directly by this job, not via SourceBucket.
  def s3_client
    @s3_client ||= AWS::S3.create_client
  end

  # get the channel id of the project which stores the user's code on this script level.
  private def get_channel_id(user, script_level)
    # get the user's storage id from the database
    user_storage_id = storage_id_for_user_id(user.id)

    # get the channel id for this user's level (or project template level) from the database
    channel_token = ChannelToken.find_channel_token(
      script_level.level,
      user_storage_id,
      script_level.script_id
    )
    raise "channel token not found for user id #{user.id} and script level id #{script_level.id}" unless channel_token
    channel_token.channel
  end

  private def read_user_code(channel_id)
    # fetch the user's code from S3
    source_data = SourceBucket.new.get(channel_id, "main.json")
    raise "main.json not found for channel id #{channel_id}" unless source_data[:status] == 'FOUND'
    code = JSON.parse(source_data[:body].string)['source']
    version = source_data[:version_id]
    [code, version]
  end

  private def read_file_from_s3(lesson_s3_name, key_suffix, allow_missing: false)
    key = "#{S3_AI_RELEASE_PATH}#{lesson_s3_name}/#{key_suffix}"
    if [:development, :test].include?(rack_env) && File.exist?(File.join("local-aws", S3_AI_BUCKET, key))
      puts "Note: Reading AI prompt from local file: #{key}"
      File.read(File.join("local-aws", S3_AI_BUCKET, key))
    else
      s3_client.get_object(bucket: S3_AI_BUCKET, key: key)[:body].read
    end
  rescue Aws::S3::Errors::NoSuchKey, StubNoSuchKey => exception
    raise exception unless allow_missing
    nil
  end

  private def read_examples(lesson_s3_name, response_type)
    raise "invalid response type #{response_type.inspect}" unless ['tsv', 'json'].include?(response_type)
    prefix = "#{S3_AI_RELEASE_PATH}#{lesson_s3_name}/examples/"
    response = s3_client.list_objects_v2(bucket: S3_AI_BUCKET, prefix: prefix)
    file_names = response.contents.map(&:key)
    file_names = file_names.map {|name| name.gsub(prefix, '')}
    js_files = file_names.select {|name| name.end_with?('.js')}
    js_files.map do |file_name|
      base_name = file_name.gsub('.js', '')
      code = s3_client.get_object(bucket: S3_AI_BUCKET, key: "#{prefix}#{file_name}")[:body].read
      response = s3_client.get_object(bucket: S3_AI_BUCKET, key: "#{prefix}#{base_name}.#{response_type}")[:body].read
      [code, response]
    end
  end

  private def get_openai_params(lesson_s3_name, code)
    params = JSON.parse(read_file_from_s3(lesson_s3_name, 'params.json'))
    prompt = read_file_from_s3(lesson_s3_name, 'system_prompt.txt')
    rubric = read_file_from_s3(lesson_s3_name, 'standard_rubric.csv')
    response_type = params['response-type'] || 'tsv'
    examples = read_examples(lesson_s3_name, response_type)
    params.merge(
      'code' => code,
      'prompt' => prompt,
      'rubric' => rubric,
      'examples' => examples.to_json,
      'api-key' => CDO.openai_evaluate_rubric_api_key,
    )
  end

  def validate_ai_config
    lesson_s3_names = UNIT_AND_LEVEL_TO_LESSON_S3_NAME.values.map(&:values).flatten.uniq
    code = 'hello world'
    lesson_s3_names.each do |lesson_s3_name|
      validate_ai_config_for_lesson(lesson_s3_name, code)
    end
    validate_learning_goals
    S3_AI_RELEASE_PATH
  end

  def validate_ai_config_for_lesson(lesson_s3_name, code)
    # this step should raise an error if any essential config files are missing
    # from the S3 release directory
    get_openai_params(lesson_s3_name, code)
  rescue Aws::S3::Errors::NoSuchKey => exception
    raise "Error validating AI config for lesson #{lesson_s3_name}: #{exception.message}\n request params: #{exception.context.params.to_h}"
  end

  # For each lesson in UNIT_AND_LEVEL_TO_LESSON_S3_NAME, validate that every
  # ai-enabled learning goal in its rubric in the database has a corresponding
  # learning goal in the rubric in S3.
  def validate_learning_goals
    UNIT_AND_LEVEL_TO_LESSON_S3_NAME.each do |unit_name, level_to_lesson|
      levels = level_to_lesson.keys
      unless Unit.find_by_name(unit_name)
        raise "Unit not found: #{unit_name.inspect}. Make sure you ran `rake seed:scripts` locally, and added it to UI_TEST_SCRIPTS for drone/ci."
      end
      levels.each do |level_name|
        level = Level.find_by_name!(level_name)
        script_level = level.script_levels.select {|sl| sl.script.name == unit_name}.first
        lesson = script_level.lesson
        rubric = Rubric.find_by!(lesson: lesson, level: level)
        validate_learning_goals_for_rubric(rubric)
      rescue StandardError => exception
        raise "Error validating learning goals for unit #{unit_name} lesson #{lesson&.relative_position.inspect} level #{level_name.inspect}: #{exception.message}"
      end
    end
  end

  def validate_learning_goals_for_rubric(rubric)
    lesson_s3_name = EvaluateRubricJob.get_lesson_s3_name(rubric.get_script_level)
    db_learning_goals = rubric.learning_goals.select(&:ai_enabled).map(&:learning_goal)
    s3_learning_goals = get_s3_learning_goals(lesson_s3_name)
    missing_learning_goals = db_learning_goals - s3_learning_goals
    if missing_learning_goals.any?
      raise "Missing AI config in S3 for lesson #{lesson_s3_name} learning goals: #{missing_learning_goals.inspect}"
    end
  end

  def get_s3_learning_goals(lesson_s3_name)
    rubric_csv = read_file_from_s3(lesson_s3_name, 'standard_rubric.csv')
    rubric_rows = CSV.parse(rubric_csv, headers: true).map(&:to_h)
    rubric_rows.map {|row| row['Key Concept']}
  end

  private def get_openai_evaluations(openai_params)
    origin = get_ai_proxy_origin
    uri = URI.parse("#{origin}/assessment")
    response = HTTParty.post(
      uri,
      body: URI.encode_www_form(openai_params),
      headers: {'Content-Type' => 'application/x-www-form-urlencoded'},
      timeout: AIPROXY_API_TIMEOUT
    )

    # Raise too many requests error if we see a 429
    # The proxy service will bubble up the 429 error from the service itself
    raise TooManyRequestsError.new(response) if response.code == 429

    raise RequestTooLargeError.new(response) if response.code == 413

    raise ServiceUnavailableError.new(response) if response.code == 503

    raise GatewayTimeoutError.new(response) if response.code == 504

    # General error will raise a generic StandardError
    raise "ERROR: #{response.code} #{response.message} #{response.body}" unless response.success?

    # Parse out the response
    JSON.parse(response.body)
  end

  private def get_ai_proxy_origin
    unless CDO.ai_proxy_origin || [:development, :test].include?(rack_env)
      raise "CDO.ai_proxy_origin is required outside of development and test environments"
    end
    CDO.ai_proxy_origin || CDO.studio_url(STUB_AI_PROXY_PATH, CDO.default_scheme)
  end

  private def validate_evaluations(evaluations, rubric)
    expected_learning_goals = rubric.learning_goals.map(&:learning_goal)
    actual_learning_goals = evaluations.map {|evaluation| evaluation['Key Concept']}
    unexpected_learning_goals = actual_learning_goals - expected_learning_goals
    unless unexpected_learning_goals.empty?
      raise "Unexpected learning goals: #{unexpected_learning_goals.inspect} (expected: #{expected_learning_goals.inspect})"
    end
  end

  private def merge_confidence_levels(ai_evaluations, ai_confidence_levels_pass_fail, ai_confidence_levels_exact_match)
    ai_evaluations.map do |evaluation|
      learning_goal = evaluation['Key Concept']
      confidence_pass_fail = ai_confidence_levels_pass_fail[learning_goal]
      evaluation['Confidence Pass Fail'] = confidence_s_to_i(confidence_pass_fail)

      if ai_confidence_levels_exact_match
        label = evaluation['Label']
        confidence_exact_match = ai_confidence_levels_exact_match[learning_goal][label]
        unless confidence_exact_match
          raise "No confidence_exact_match for learning goal: #{learning_goal}, label: #{label} evaluation: #{JSON.pretty_generate(evaluation)} ai_confidence_levels_exact_match: #{JSON.pretty_generate(ai_confidence_levels_exact_match)}"
        end
        evaluation['Confidence Exact Match'] = confidence_s_to_i(confidence_exact_match)
      end
      evaluation
    end
  end

  private def write_ai_evaluations(user, ai_evaluations, rubric, rubric_ai_evaluation, project_version)
    ActiveRecord::Base.transaction do
      # Update the base rubric status
      rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:SUCCESS]

      # Record the version of the code we evaluated
      rubric_ai_evaluation.project_version = project_version

      # Write out all of the learning goal records
      ai_mapping = {}
      ai_evaluations.each do |ai_evaluation|
        ai_mapping[ai_evaluation['Key Concept']] = ai_evaluation
      end

      # For every learning goal in the rubric, find out if the AI has
      # assessed it. If so, create a learning goal AI evaluation record.
      rubric.learning_goals.each do |lg|
        next unless ai_mapping.key?(lg.learning_goal)
        ai_evaluation = ai_mapping[lg.learning_goal]
        label = ai_evaluation.key?('Grade') ? ai_evaluation['Grade'] : ai_evaluation['Label']
        LearningGoalAiEvaluation.create!(
          learning_goal_id: lg.id,
          rubric_ai_evaluation_id: rubric_ai_evaluation.id,
          understanding: understanding_s_to_i(label),
          ai_confidence: ai_evaluation['Confidence Pass Fail'],
          ai_confidence_exact_match: ai_evaluation['Confidence Exact Match'],
          observations: ai_evaluation['Observations'] || '',
          evidence: ai_evaluation['Evidence'] || '',
        )
      end

      # Save the rubric evaluation record
      rubric_ai_evaluation.save!
    end
  end

  private def understanding_s_to_i(understanding)
    case understanding
    when 'Extensive Evidence'
      SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.EXTENSIVE
    when 'Convincing Evidence'
      SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.CONVINCING
    when 'Limited Evidence'
      SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.LIMITED
    when 'No Evidence'
      SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.NONE
    else
      raise "Unexpected understanding: #{understanding}"
    end
  end

  private def confidence_s_to_i(confidence_level)
    confidence_levels = LearningGoalAiEvaluation::AI_CONFIDENCE_LEVELS.keys.map(&:to_s)
    raise "Unexpected confidence level: #{confidence_level.inspect}" unless confidence_levels.include?(confidence_level)
    LearningGoalAiEvaluation::AI_CONFIDENCE_LEVELS[confidence_level.to_sym]
  end
end

# Sending token usage to CloudWatch
require 'csv'

class EvaluateRubricJob < ApplicationJob
  STUB_AI_PROXY_PATH = '/api/test/ai_proxy'.freeze

  AIPROXY_API_TIMEOUT = 165

  ATTEMPTS_ON_RATE_LIMIT = 3
  ATTEMPTS_ON_TIMEOUT_ERROR = 2
  ATTEMPTS_ON_SERVICE_UNAVAILABLE = 3
  ATTEMPTS_ON_GATEWAY_TIMEOUT = 3

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

  class StudentLimitError < StandardError
    def initialize(user_id:, rubric_id:)
      super("Student #{user_id} has exceeded the limit of evaluations for rubric #{rubric_id}")
    end
  end

  class TeacherLimitError < StandardError
    def initialize(user_id:, requester_id:, rubric_id:)
      super("Teacher #{requester_id} has exceeded the limit of evaluations for student #{user_id} on rubric #{rubric_id}")
    end
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

  rescue_from(StudentLimitError) do |exception|
    if rack_env?(:development)
      puts "EvaluateRubricJob StudentLimitError: #{exception.message}"
    end

    # Record the failure mode, so we can show the right message to the teacher
    rubric_ai_evaluation = pass_in_or_create_rubric_ai_evaluation(self)
    rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:STUDENT_LIMIT_EXCEEDED]
    rubric_ai_evaluation.save!
  end

  rescue_from(TeacherLimitError) do |exception|
    if rack_env?(:development)
      puts "EvaluateRubricJob TeacherLimitError: #{exception.message}"
    end

    # Record the failure mode, so we can show the right message to the teacher
    rubric_ai_evaluation = pass_in_or_create_rubric_ai_evaluation(self)
    rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:TEACHER_LIMIT_EXCEEDED]
    rubric_ai_evaluation.save!
  end

  # Retry on any reported rate limit (429 status). With 3 attempts, 'exponentially_longer' waits 3s, then 18s.
  retry_on TooManyRequestsError, wait: :exponentially_longer, attempts: ATTEMPTS_ON_RATE_LIMIT do |job, error|
    AiRubricMetrics.log_metric(metric_name: :RateLimit)
    AiRubricMetrics.log_to_firehose(job: job, error: error, event_name: 'rate-limit')
  end

  # Retry just once on a timeout. It is likely to timeout again.
  retry_on Net::ReadTimeout, Timeout::Error, wait: 10.seconds, attempts: ATTEMPTS_ON_TIMEOUT_ERROR do |job, error|
    AiRubricMetrics.log_metric(metric_name: :TimeoutError)
    AiRubricMetrics.log_to_firehose(job: job, error: error, event_name: 'timeout-error')
  end

  # Retry on a 503 Service Unavailable error, including those returned by aiproxy
  # when openai returns 500.
  retry_on ServiceUnavailableError, wait: :exponentially_longer, attempts: ATTEMPTS_ON_SERVICE_UNAVAILABLE do |job, error|
    agent = 'none'
    if error.message.downcase.include?('openai')
      agent = 'openai'
    elsif error.message.downcase.include?('bedrock')
      agent = 'bedrock'
    end
    AiRubricMetrics.log_metric(metric_name: :ServiceUnavailable, agent: agent)
    AiRubricMetrics.log_to_firehose(job: job, error: error, event_name: 'service-unavailable', agent: agent)
  end

  # Retry on a 504 Gateway Timeout error, including those returned by aiproxy
  # when openai request times out.
  retry_on GatewayTimeoutError, wait: :exponentially_longer, attempts: ATTEMPTS_ON_GATEWAY_TIMEOUT do |job, error|
    agent = 'none'
    if error.message.downcase.include?('openai')
      agent = 'openai'
    elsif error.message.downcase.include?('bedrock')
      agent = 'bedrock'
    end
    AiRubricMetrics.log_metric(metric_name: :GatewayTimeout, agent: agent)
    AiRubricMetrics.log_to_firehose(job: job, error: error, event_name: 'gateway-timeout', agent: agent)
  end

  def perform(user_id:, requester_id:, script_level_id:, rubric_ai_evaluation_id: nil)
    # prevent the job from running if per-user limits have been exceeded.
    check_evaluation_limits(user_id: user_id, requester_id: requester_id, script_level_id: script_level_id)

    user = User.find(user_id)
    script_level = ScriptLevel.find(script_level_id)
    lesson_s3_name = AiRubricConfig.get_lesson_s3_name(script_level)

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

    openai_params = AiRubricConfig.get_openai_params(lesson_s3_name, code)
    response = get_openai_evaluations(openai_params)

    # Log tokens and usage information
    AiRubricMetrics.log_token_metrics(response)

    # Get and validate the response data
    ai_evaluations = response['data']
    validate_evaluations(ai_evaluations, rubric)

    ai_confidence_levels_pass_fail = JSON.parse(AiRubricConfig.read_file_from_s3(lesson_s3_name, 'confidence.json'))
    confidence_exact_json = AiRubricConfig.read_file_from_s3(lesson_s3_name, 'confidence-exact.json', allow_missing: true)
    ai_confidence_levels_exact_match = confidence_exact_json ? JSON.parse(confidence_exact_json) : nil
    merged_evaluations = merge_confidence_levels(ai_evaluations, ai_confidence_levels_pass_fail, ai_confidence_levels_exact_match)

    write_ai_evaluations(user, merged_evaluations, rubric, rubric_ai_evaluation, project_version)
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

  # Check if the student or teacher has exceeded the evaluation limit for the rubric.
  private def check_evaluation_limits(user_id:, requester_id:, script_level_id:)
    script_level = ScriptLevel.find(script_level_id)
    rubric = Rubric.find_by!(lesson_id: script_level.lesson.id, level_id: script_level.level.id)

    requested_by_self = user_id == requester_id

    count = RubricAiEvaluation.where(
      user_id: user_id,
      requester_id: requester_id,
      rubric_id: rubric.id,
      status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:SUCCESS]
    ).count

    raise StudentLimitError.new(user_id: user_id, rubric_id: rubric.id) if requested_by_self && count >= SharedConstants::RUBRIC_AI_EVALUATION_LIMITS[:STUDENT_LIMIT]
    raise TeacherLimitError.new(user_id: user_id, requester_id: requester_id, rubric_id: rubric.id) if !requested_by_self && count >= SharedConstants::RUBRIC_AI_EVALUATION_LIMITS[:TEACHER_LIMIT]
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

  private def get_openai_evaluations(openai_params)
    origin = get_ai_proxy_origin
    uri = URI.parse("#{origin}/assessment")
    response = HTTParty.post(
      uri,
      body: URI.encode_www_form(openai_params),
      headers: {'Content-Type' => 'application/x-www-form-urlencoded', 'Authorization' => CDO.aiproxy_api_key},
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

  private def confidence_s_to_i(confidence_level)
    confidence_levels = LearningGoalAiEvaluation::AI_CONFIDENCE_LEVELS.keys.map(&:to_s)
    raise "Unexpected confidence level: #{confidence_level.inspect}" unless confidence_levels.include?(confidence_level)
    LearningGoalAiEvaluation::AI_CONFIDENCE_LEVELS[confidence_level.to_sym]
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
end

# Sending token usage to CloudWatch
require 'cdo/aws/metrics'

class EvaluateRubricJob < ApplicationJob
  queue_as :default

  S3_AI_BUCKET = 'cdo-ai'.freeze

  # 2D Map from unit name and level name, to the name of the lesson files in S3
  # which will be used for AI evaluation.
  # TODO: This is a temporary solution. After the pilot, we should at least make
  # the S3 pointer editable on levelbuilder, and eventually make all of the data
  # it points to editable there too.
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME = {
    'csd3-2023' => {
      'CSD U3 Interactive Card Final_2023' => 'CSD-2022-U3-L17',
      'CSD U3 Sprites scene challenge_2023' => 'New-U3-2022-L10',
      'CSD web project animated review_2023' => 'New-U3-2022-L13',
      'CSD games sidescroll review_2023' => 'New-U3-2022-L20'
    }
  }

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

  AI_RUBRIC_METRICS_NAMESPACE = 'AiRubric'.freeze

  # Write out metrics reflected in the response to CloudWatch
  #
  # Currently, this keeps track of a curated set of metrics returned
  # within the 'metadata.usage' field of the returned response from
  # the AI proxy service.
  #
  # @param [Hash] response The parsed JSON response from the AI proxy.
  def self.log_metrics(response)
    # Record the metadata
    # The aiproxy service will report the usage in the metadata via:
    # { metadata: { agent: 'openai', usage: { total_tokens: 1234, prompt_tokens: 432, completion_tokens: 802 } } }
    [:TotalTokens, :PromptTokens, :CompletionTokens].each do |name|
      # Send a metric to the AIRubric namespace under categories for both the
      # service used (openai, etc) and the current environment.
      tokens = response.dig('metadata', 'usage', name.to_s.underscore)
      next if tokens.nil?
      Cdo::Metrics.push(
        AI_RUBRIC_METRICS_NAMESPACE,
        [
          {
            metric_name: name,
            value: tokens,
            dimensions: [
              {name: 'Environment', value: CDO.rack_env},
              {name: 'Agent', value: response.dig('metadata', 'agent') || 'unknown'},
            ],
            unit: 'Count'
          }
        ]
      )
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

  RETRIES_ON_RATE_LIMIT = 3

  # Retry on any reported rate limit (429 status) 'exponentially_longer' waits 3s, 18s, and then 83s.
  retry_on TooManyRequestsError, wait: :exponentially_longer, attempts: RETRIES_ON_RATE_LIMIT do |job, error|
    # Job arguments are always serializable, so we just pull out the hash
    # and send it as context.
    options = job.arguments.first

    # Send it to honeybadger even though we are handling the error via retry
    Honeybadger.notify(
      error,
      error_message: "Retrying rubric evaluation job due to rate limiting (429).",
      context: options
    )
  end

  RETRIES_ON_TIMEOUT = 2

  # Retry just once on a timeout. It is likely to timeout again.
  retry_on Net::ReadTimeout, Timeout::Error, wait: 10.seconds, attempts: RETRIES_ON_TIMEOUT do |job, error|
    # Job arguments are always serializable, so we just pull out the hash
    # and send it as context.
    options = job.arguments.first

    # Send it to honeybadger even though we are handling the error via retry
    Honeybadger.notify(
      error,
      error_message: "Retrying rubric evaluation job due to timeout.",
      context: options
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
    EvaluateRubricJob.log_metrics(response)

    # Get and validate the response data
    ai_evaluations = response['data']
    validate_evaluations(ai_evaluations, rubric)

    ai_confidence_levels = JSON.parse(read_file_from_s3(lesson_s3_name, 'confidence.json'))
    merged_evaluations = merge_confidence_levels(ai_evaluations, ai_confidence_levels)

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
  private def s3_client
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

  private def read_file_from_s3(lesson_s3_name, key_suffix)
    key = "teaching_assistant/lessons/#{lesson_s3_name}/#{key_suffix}"
    s3_client.get_object(bucket: S3_AI_BUCKET, key: key)[:body].read
  end

  private def read_examples(lesson_s3_name)
    prefix = "teaching_assistant/lessons/#{lesson_s3_name}/examples/"
    response = s3_client.list_objects_v2(bucket: S3_AI_BUCKET, prefix: prefix)
    file_names = response.contents.map(&:key)
    file_names = file_names.map {|name| name.gsub(prefix, '')}
    js_files = file_names.select {|name| name.end_with?('.js')}
    js_files.map do |file_name|
      base_name = file_name.gsub('.js', '')
      code = s3_client.get_object(bucket: S3_AI_BUCKET, key: "#{prefix}#{file_name}")[:body].read
      response = s3_client.get_object(bucket: S3_AI_BUCKET, key: "#{prefix}#{base_name}.tsv")[:body].read
      [code, response]
    end
  end

  private def get_openai_params(lesson_s3_name, code)
    params = JSON.parse(read_file_from_s3(lesson_s3_name, 'params.json'))
    prompt = read_file_from_s3(lesson_s3_name, 'system_prompt.txt')
    rubric = read_file_from_s3(lesson_s3_name, 'standard_rubric.csv')
    examples = read_examples(lesson_s3_name)
    params.merge(
      'code' => code,
      'prompt' => prompt,
      'rubric' => rubric,
      'examples' => examples.to_json,
      'api-key' => CDO.openai_evaluate_rubric_api_key,
    )
  end

  private def get_openai_evaluations(openai_params)
    uri = URI.parse("#{CDO.ai_proxy_origin}/assessment")
    response = HTTParty.post(
      uri,
      body: URI.encode_www_form(openai_params),
      headers: {'Content-Type' => 'application/x-www-form-urlencoded'},
      timeout: 120
    )

    # Raise too many requests error if we see a 429
    # The proxy service will bubble up the 429 error from the service itself
    raise TooManyRequestsError.new(response) if response.code == 429

    # General error will raise a generic StandardError
    raise "ERROR: #{response.code} #{response.message} #{response.body}" unless response.success?

    # Parse out the response
    JSON.parse(response.body)
  end

  private def validate_evaluations(evaluations, rubric)
    expected_learning_goals = rubric.learning_goals.map(&:learning_goal)
    actual_learning_goals = evaluations.map {|evaluation| evaluation['Key Concept']}
    unexpected_learning_goals = actual_learning_goals - expected_learning_goals
    unless unexpected_learning_goals.empty?
      raise "Unexpected learning goals: #{unexpected_learning_goals.inspect} (expected: #{expected_learning_goals.inspect})"
    end
  end

  private def merge_confidence_levels(ai_evaluations, ai_confidence_levels)
    ai_evaluations.map do |evaluation|
      learning_goal = evaluation['Key Concept']
      confidence_level = ai_confidence_levels[learning_goal]
      evaluation.merge('Confidence' => confidence_s_to_i(confidence_level))
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
        LearningGoalAiEvaluation.create!(
          learning_goal_id: lg.id,
          rubric_ai_evaluation_id: rubric_ai_evaluation.id,
          understanding: understanding_s_to_i(ai_evaluation['Grade']),
          ai_confidence: ai_evaluation['Confidence'],
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
    raise "Unexpected confidence level: #{confidence_level}" unless confidence_levels.include?(confidence_level)
    LearningGoalAiEvaluation::AI_CONFIDENCE_LEVELS[confidence_level.to_sym]
  end
end

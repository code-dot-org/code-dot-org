# Sending token usage to CloudWatch
require 'cdo/aws/metrics'
require 'csv'

class GenerateAILessonSummariesJob < ApplicationJob
  # STUB_AI_PROXY_PATH = '/api/test/ai_proxy'.freeze

  # AIPROXY_API_TIMEOUT = 165

  # ATTEMPTS_ON_RATE_LIMIT = 3
  # ATTEMPTS_ON_TIMEOUT_ERROR = 2
  # ATTEMPTS_ON_SERVICE_UNAVAILABLE = 3
  # ATTEMPTS_ON_GATEWAY_TIMEOUT = 3

  # # This is raised if there is any raised error due to a rate limit, e.g. a 429
  # # received from the aiproxy service.
  # class TooManyRequestsError < StandardError
  #   attr_reader :response

  #   # Creates a TooManyRequestsError for the given response.
  #   #
  #   # @param [HTTParty::Response] response The HTTP response that exhibits this error.
  #   def initialize(response)
  #     @response = response

  #     super("Too many requests for #{response.request.uri}")
  #   end
  # end

  # # This is raised if the request is too large for the openai, indicating that
  # # the code was too long relative to the LLM's context window.
  # class RequestTooLargeError < StandardError
  #   attr_reader :response

  #   # Creates a RequestTooLargeError for the given response.
  #   #
  #   # @param [HTTParty::Response] response The HTTP response that exhibits this error.
  #   def initialize(response)
  #     @response = response

  #     super("Request too large for #{response.request.uri}: #{response.code} #{response.message} #{response.body}")
  #   end
  # end

  # class ServiceUnavailableError < StandardError
  #   attr_reader :response

  #   # Creates a ServiceUnavailableError for the given response.
  #   #
  #   # @param [HTTParty::Response] response The HTTP response that exhibits this error.
  #   def initialize(response)
  #     @response = response

  #     super("Service unavailable for #{response.request.uri}: #{response.code} #{response.message} #{response.body}")
  #   end
  # end

  # class GatewayTimeoutError < StandardError
  #   attr_reader :response

  #   # Creates a GatewayTimeoutError for the given response.
  #   #
  #   # @param [HTTParty::Response] response The HTTP response that exhibits this error.
  #   def initialize(response)
  #     @response = response

  #     super("Gateway Timeout for #{response.request.uri}: #{response.code} #{response.message} #{response.body}")
  #   end
  # end

  # before_enqueue do |job|
  #   rubric_ai_evaluation = pass_in_or_create_rubric_ai_evaluation(job)
  #   rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:QUEUED]
  #   rubric_ai_evaluation.save!
  # end

  # before_perform do |job|
  #   rubric_ai_evaluation = pass_in_or_create_rubric_ai_evaluation(job)
  #   rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:RUNNING]
  #   rubric_ai_evaluation.save!
  # end

  # # Write out any general error status for any exception
  # rescue_from(StandardError) do |exception|
  #   if rack_env?(:development)
  #     puts "EvaluateRubricJob Error: #{exception.full_message}"
  #   end

  #   # Record the failure, if we can
  #   begin
  #     rubric_ai_evaluation = pass_in_or_create_rubric_ai_evaluation(self)
  #     rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:FAILURE]
  #     rubric_ai_evaluation.save!
  #   rescue StandardError
  #     # Ignore cascading errors when the rubric record does not exist
  #   end

  #   # Re-raise the original exception to track it elsewhere
  #   raise exception
  # end

  # rescue_from(RequestTooLargeError) do |exception|
  #   if rack_env?(:development)
  #     puts "EvaluateRubricJob RequestTooLargeError: #{exception.message}"
  #   end

  #   # Record the failure mode, so we can show the right message to the teacher
  #   rubric_ai_evaluation = pass_in_or_create_rubric_ai_evaluation(self)
  #   rubric_ai_evaluation.status = SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:REQUEST_TOO_LARGE]
  #   rubric_ai_evaluation.save!
  # end

  # # Retry on any reported rate limit (429 status). With 3 attempts, 'exponentially_longer' waits 3s, then 18s.
  # retry_on TooManyRequestsError, wait: :exponentially_longer, attempts: ATTEMPTS_ON_RATE_LIMIT do |job, error|
  #   AiRubricMetrics.log_metric(metric_name: :RateLimit)
  #   AiRubricMetrics.log_to_firehose(job: job, error: error, event_name: 'rate-limit')
  # end

  # # Retry just once on a timeout. It is likely to timeout again.
  # retry_on Net::ReadTimeout, Timeout::Error, wait: 10.seconds, attempts: ATTEMPTS_ON_TIMEOUT_ERROR do |job, error|
  #   AiRubricMetrics.log_metric(metric_name: :TimeoutError)
  #   AiRubricMetrics.log_to_firehose(job: job, error: error, event_name: 'timeout-error')
  # end

  # # Retry on a 503 Service Unavailable error, including those returned by aiproxy
  # # when openai returns 500.
  # retry_on ServiceUnavailableError, wait: :exponentially_longer, attempts: ATTEMPTS_ON_SERVICE_UNAVAILABLE do |job, error|
  #   agent = 'none'
  #   if error.message.downcase.include?('openai')
  #     agent = 'openai'
  #   elsif error.message.downcase.include?('bedrock')
  #     agent = 'bedrock'
  #   end
  #   AiRubricMetrics.log_metric(metric_name: :ServiceUnavailable, agent: agent)
  #   AiRubricMetrics.log_to_firehose(job: job, error: error, event_name: 'service-unavailable', agent: agent)
  # end

  # # Retry on a 504 Gateway Timeout error, including those returned by aiproxy
  # # when openai request times out.
  # retry_on GatewayTimeoutError, wait: :exponentially_longer, attempts: ATTEMPTS_ON_GATEWAY_TIMEOUT do |job, error|
  #   agent = 'none'
  #   if error.message.downcase.include?('openai')
  #     agent = 'openai'
  #   elsif error.message.downcase.include?('bedrock')
  #     agent = 'bedrock'
  #   end
  #   AiRubricMetrics.log_metric(metric_name: :GatewayTimeout, agent: agent)
  #   AiRubricMetrics.log_to_firehose(job: job, error: error, event_name: 'gateway-timeout', agent: agent)
  # end

  # def perform(user_id:, lesson_id:)
  #   user = User.find(user_id)
  #   lesson = Lesson.find(lesson_id)

  #   # Retrieve lesson plan
  #   # Create ai_lesson_summary record
  #   # Create
  # end
end

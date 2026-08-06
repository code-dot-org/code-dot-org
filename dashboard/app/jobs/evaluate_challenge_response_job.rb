require 'cdo/share_filtering'

# Evaluates a student's challenge response against its challenge's rubric
# with OpenAI, recording the outcome on the response row. Enqueued from
# ChallengeResponsesController#evaluate after the student submits.
#
# The student's text and transcript are run through the PII and profanity
# filters first; a hit records a violation status and nothing is sent to the
# LLM. On success the parsed evaluation is stored in evaluation_result
# (scored per rubric criterion, teacher-only) and its constructive,
# score-free feedback is copied to student_feedback for the student. Neither
# is displayed at submit time — teacher view and student gallery are future
# work — so nothing here notifies the client.
class EvaluateChallengeResponseJob < ApplicationJob
  MODEL = 'gpt-4o-mini-2024-07-18'.freeze

  # Raised when OpenAI returns a non-200 response.
  class OpenaiRequestError < StandardError
    attr_reader :response

    # @param [HTTParty::Response] response The failing HTTP response.
    def initialize(response)
      @response = response
      super("OpenAI request failed: #{response.code} #{response.body&.truncate(500)}")
    end
  end

  before_enqueue do |job|
    job.challenge_response.update!(evaluation_status: :queued)
  end

  before_perform do |job|
    # A retried or duplicate-enqueued job must not re-bill an evaluation that
    # already succeeded. Checked here rather than in perform because this
    # hook would otherwise clobber the success status with :running.
    throw :abort if job.challenge_response.evaluation_success?
    job.challenge_response.update!(evaluation_status: :running)
  end

  # Record a generic failure for any unhandled exception, then re-raise so
  # the error is tracked (and retried where retry_on applies).
  rescue_from(StandardError) do |exception|
    begin
      challenge_response.update!(evaluation_status: :failure)
    rescue StandardError
      # Ignore cascading errors when the response row no longer exists.
    end
    raise exception
  end

  # Content filter hits are terminal, not errors: record which filter fired
  # and stop. Retrying would re-send the same content.
  rescue_from(PIIFilterException) do
    challenge_response.update!(evaluation_status: :pii_violation)
  end

  rescue_from(ProfanityFilterException) do
    challenge_response.update!(evaluation_status: :profanity_violation)
  end

  # Retry just once on a timeout. It is likely to time out again.
  retry_on Net::OpenTimeout, Net::ReadTimeout, Timeout::Error, wait: 10.seconds, attempts: 2

  def perform(challenge_response_id:)
    challenge = challenge_response.challenge
    filter_student_content!

    response = ChallengeEvaluationOpenaiHelper::Client.new(
      CDO.openai_measures_of_learning_api_key, MODEL
    ).request_evaluation(
      ChallengeEvaluationPromptHelper.messages(challenge_response),
      ChallengeEvaluationPromptHelper.response_format(challenge)
    )
    raise OpenaiRequestError.new(response) unless response.code == 200

    content = response.parsed_response&.dig('choices', 0, 'message', 'content')
    raise "OpenAI response had no message content for challenge_response #{challenge_response.id}" if content.blank?

    evaluation = JSON.parse(content)
    challenge_response.update!(
      evaluation_result: evaluation,
      student_feedback: evaluation['student_feedback'],
      evaluation_status: :success,
      evaluated_at: Time.now
    )
  end

  # The response this job run is evaluating, from the job's kwargs. Memoized;
  # used by the enqueue/perform/rescue hooks as well as perform itself.
  def challenge_response
    @challenge_response ||= ChallengeResponse.find(arguments.first[:challenge_response_id])
  end

  # Raises PIIFilterException or ProfanityFilterException if the student's
  # text or transcript trips the corresponding filter.
  private def filter_student_content!
    text = [challenge_response.student_text, challenge_response.transcript].select(&:present?).join("\n")
    return if text.blank?
    ShareFiltering.find_pii_failure(text, exceptions: true)
    ShareFiltering.find_profanity_failure(text, 'en', exceptions: true)
  end
end

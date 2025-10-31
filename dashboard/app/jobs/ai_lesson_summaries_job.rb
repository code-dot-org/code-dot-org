require 'cdo/aws/metrics'

class AiLessonSummariesJob < ApplicationJob
  queue_as :default

  before_enqueue do |job|
    request = job.arguments.first[:request]
    request.update!(execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:QUEUED])
  end

  before_perform do |job|
    request = job.arguments.first[:request]
    request.update!(execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:RUNNING])
    @start_time = Time.now
  end

  after_perform do |job|
    request = job.arguments.first[:request]
    request.update!(execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS])
    @execution_time = Time.now - @start_time
  end

  # Catch any exceptions that occur during the job and update the request status accordingly.
  rescue_from StandardError do |exception|
    if rack_env?(:development)
      puts "AiLessonSummariesJob Error: #{exception.full_message}"
    end

    request = arguments.first[:request]
    request.update!(response: exception.message, execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:FAILURE])
    Honeybadger.notify(
      "AiLessonSummariesJob failed with unexpected error: #{exception.message}",
      context: {
        request: request.to_json
      }
    )

    # Re-raise error to notify our system of the failed job.
    raise exception
  end

  def perform(request:)
    request[:lesson_ids].each do |lesson_id|
      AiLessonSummariesHelper.retrieve_and_save_ai_lesson_summary(request[:user_id], lesson_id)
    end
  end
end

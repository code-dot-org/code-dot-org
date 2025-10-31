require 'cdo/aws/metrics'

class AiLessonSummariesJob < ApplicationJob
  queue_as :default

  # Catch any exceptions that occur during the job and update the request status accordingly.
  rescue_from StandardError do |exception|
    if rack_env?(:development)
      puts "AiLessonSummariesJob Error: #{exception.full_message}"
    end

    request = arguments.first[:request]
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

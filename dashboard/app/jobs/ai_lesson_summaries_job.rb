require 'cdo/aws/metrics'

class AiLessonSummariesJob < ApplicationJob
  queue_as :default

  # Catch any exceptions that occur during the job and update the request status accordingly.
  rescue_from StandardError do |exception|
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
      AiLessonSummariesHelper.retrieve_and_save_ai_lesson_summary(lesson_id, request[:user_id], AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])
    end
  end
end

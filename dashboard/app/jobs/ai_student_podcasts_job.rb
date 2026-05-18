require 'cdo/aws/metrics'

class AiStudentPodcastsJob < ApplicationJob
  queue_as :default

  # Catch any exceptions that occur during the job and update the request status accordingly.
  rescue_from StandardError do |exception|
    request = arguments.first[:request]
    Honeybadger.notify(
      "AiStudentPodcastsJob failed with unexpected error: #{exception.message}",
      context: {
        request: request.to_json
      }
    )
    # Re-raise error to notify our system of the failed job.
    raise exception
  end

  def perform(request:)
    AiStudentPodcastsHelper.create_and_save_to_s3(request[:student_podcast_data])
  end
end

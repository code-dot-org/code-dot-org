require 'cdo/aws/metrics'

class AiLessonSummariesJob < ApplicationJob
  queue_as :default

  after_perform do |job|
    request = job.arguments.first[:request]

    lesson_ids = request[:lesson_ids]
    user_id = request[:user_id]

    user = User.find_by(id: user_id)
    next unless user

    unit_id = request[:unit_id]
    section = unit_id.present? ? user.sections.where(script_id: unit_id).first : nil
    section ||= user.sections.first

    TeacherNotification.create!(
      user_id: user_id,
      title: 'AI Lesson Summaries ready to view',
      description: "The lesson summaries for #{lesson_ids.size} lessons have been generated and are now available.",
      icon_name: 'solid-flask-sparkle',
      icon_color: 'Aqua',
      href_links: [{text: 'View lesson materials',
                   url: "/teacher_dashboard/sections/#{section.id}/lesson_materials"}],
    )
  end

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

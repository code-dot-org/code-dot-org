class AdminStandardsController < ApplicationController
  before_action :authenticate_user!
  # Bypass enforce_google_sso_for_admin requirements so we can import standards
  # associations for UI tests.
  if Rails.env.production?
    before_action :require_admin
  end

  def index
    @units_with_standards = Script.units_with_standards.sort
  end

  def import_standards
    script = Script.find_by_name(params["unit_name"])

    code_studio_lessons = {}
    script&.lessons&.each do |lesson|
      code_studio_lessons[lesson.localized_name] = lesson
    end

    missing_standards = []
    missing_lessons = []

    curriculum_builder_lessons = params["lessons"]

    curriculum_builder_lessons&.each do |l|
      lesson = code_studio_lessons[l["title"]]

      unless lesson
        missing_lessons << l["title"]
      end

      updated_standards = []

      l["standards"].each do |standard|
        framework = Framework.find_by(shortcode: standard['framework'].downcase)
        code_studio_standard = Standard.find_by(
          {
            framework: framework,
            shortcode: standard["shortcode"]
          }
        )

        unless code_studio_standard
          missing_standards << standard["shortcode"]
        end

        if code_studio_standard && lesson
          updated_standards << code_studio_standard
        end
      end
      lesson&.standards = updated_standards
      lesson&.save!
    end

    if !missing_standards.empty? || !missing_lessons.empty?
      render json: {status: 'failure', message: "Couldn't find standards: #{missing_standards}. Couldn't find lessons: #{missing_lessons}"}
    else
      render json: {status: 'success', message: "Hooray! Importing standards associations for #{script&.name} worked."}
    end
  end
end

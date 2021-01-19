class AdminStandardsController < ApplicationController
  before_action :authenticate_user!
  # Bypass enforce_google_sso_for_admin requirements so we can import standards
  # associations for UI tests.
  if Rails.env.production?
    before_action :require_admin
  end

  def index
    @scripts_with_standards = Script.scripts_with_standards.sort
  end

  def import_standards
    script = Script.find_by_name(params["unit_name"])

    code_studio_stages = {}
    script&.lessons&.each do |stage|
      code_studio_stages[stage.localized_name] = stage
    end

    missing_standards = []
    missing_stages = []

    curriculum_builder_lessons = params["lessons"]

    curriculum_builder_lessons&.each do |lesson|
      stage = code_studio_stages[lesson["title"]]

      unless stage
        missing_stages << lesson["title"]
      end

      updated_standards = []

      lesson["standards"].each do |standard|
        code_studio_standard = Standard.find_by(
          {
            organization: standard["framework"],
            organization_id: standard["shortcode"]
          }
        )

        unless code_studio_standard
          missing_standards << standard["shortcode"]
        end

        if code_studio_standard && stage
          updated_standards << code_studio_standard
        end
      end
      stage&.standards = updated_standards
      stage&.save!
    end

    if !missing_standards.empty? || !missing_stages.empty?
      render json: {status: 'failure', message: "Couldn't find standards: #{missing_standards}. Couldn't find stages: #{missing_stages}"}
    else
      render json: {status: 'success', message: "Hooray! Importing standards associations for #{script&.name} worked."}
    end
  end
end

module Pd::Application
  class PrincipalApprovalApplicationController < ApplicationController
    def new
      # Temporary security settings
      # TODO: Mehal - remove this and associated Gatekeeper key after going to prod
      if Rails.env.production? && !current_user.try(:workshop_admin?) && Gatekeeper.disallows('pd_principal_approval_application')
        return render :not_available
      end

      teacher_application = Pd::Application::Teacher1819Application.find_by(application_guid: params[:application_guid])

      return render :not_found unless teacher_application

      application_hash = teacher_application.sanitize_form_data_hash

      @teacher_application = {
        course: Pd::Application::ApplicationConstants::COURSE_NAMES[teacher_application.course],
        name: teacher_application.applicant_name,
        application_guid: teacher_application.application_guid,
        principal_first_name: application_hash[:principal_first_name],
        principal_last_name: application_hash[:principal_last_name],
        principal_title: application_hash[:principal_title],
        principal_email: application_hash[:principal_email]
      }

      if Pd::Application::PrincipalApproval1819Application.exists?(application_guid: params[:application_guid])
        return render :submitted
      end

      @script_data = {
        props: {
          options: PrincipalApproval1819Application.options.camelize_keys,
          requiredFields: PrincipalApproval1819Application.camelize_required_fields,
          apiEndpoint: '/api/v1/pd/application/principal_approval',
          teacherApplication: @teacher_application
        }.to_json
      }
    end
  end
end

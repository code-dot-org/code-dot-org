module Pd::Application
  class PrincipalApprovalApplicationController < ApplicationController
    include ApplicationConstants
    include ActiveApplicationModels

    def new
      # Temporary security settings
      # TODO: Mehal - remove this and associated Gatekeeper key after going to prod
      if Rails.env.production? && !current_user.try(:workshop_admin?) && Gatekeeper.disallows('pd_principal_approval_application')
        return render :not_available
      end

      teacher_application = TEACHER_APPLICATION_CLASS.find_by(application_guid: params[:application_guid])

      return render :not_found unless teacher_application

      application_hash = teacher_application.sanitize_form_data_hash

      @teacher_application = {
        course: Pd::Application::ApplicationConstants::COURSE_NAMES[teacher_application.course],
        name: teacher_application.applicant_name,
        application_guid: teacher_application.application_guid,
        principal_first_name: application_hash[:principal_first_name],
        principal_last_name: application_hash[:principal_last_name],
        principal_title: application_hash[:principal_title],
        principal_email: application_hash[:principal_email],
        school_id: teacher_application.school_id,
        school_zip_code: School.find_by_id(teacher_application.school_id)&.zip
      }

      # Return submitted if the approval exists and is not a placeholder
      # Rather annoyingly, we can't say "unless existing_approval&.placeholder?" because
      # if there is no approval, (handling legacy case and proper fallback behavior
      # in case we fail to create placeholders) we'd be rendering submitted
      existing_approval = PRINCIPAL_APPROVAL_APPLICATION_CLASS.find_by(application_guid: params[:application_guid])
      if existing_approval && !existing_approval.placeholder?
        return render :submitted
      end

      @teacher_application_school_stats = Api::V1::Pd::ApplicationSerializer.new(
        teacher_application
      ).school_stats.transform_values {|v| v.to_i.to_s}

      @year = APPLICATION_CURRENT_YEAR

      @unit_data = {
        props: {
          options: PRINCIPAL_APPROVAL_APPLICATION_CLASS.options.camelize_keys,
          requiredFields: PRINCIPAL_APPROVAL_APPLICATION_CLASS.camelize_required_fields,
          apiEndpoint: '/api/v1/pd/application/principal_approval',
          teacherApplication: @teacher_application,
          teacherApplicationSchoolStats: @teacher_application_school_stats
        }.to_json
      }
    end
  end
end

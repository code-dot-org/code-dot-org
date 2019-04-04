module Api::V1::Pd::Application
  class PrincipalApprovalApplicationsController < Api::V1::Pd::FormsController
    include Pd::Application::ActiveApplicationModels

    def new_form
      @application = PRINCIPAL_APPROVAL_APPLICATION_CLASS.find_or_create_by(
        application_guid: params.require(:application_guid)
      )
    end

    protected

    def on_successful_create
      # Approval application created, now score corresponding teacher application
      teacher_application = TEACHER_APPLICATION_CLASS.find_by!(application_guid: @application.application_guid)
      teacher_application.on_successful_principal_approval_create(@application)
    end
  end
end

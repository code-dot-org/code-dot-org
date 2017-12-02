module Api::V1::Pd::Application
  class PrincipalApprovalApplicationsController < Api::V1::Pd::FormsController
    def new_form
      @application = Pd::Application::PrincipalApproval1819Application.new(
        # current_user may not exist but might as well record it
        user: current_user,
        application_guid: params.require(:application_guid)
      )
    end

    protected

    def on_successful_create
      ::Pd::Application::Teacher1819ApplicationMailer.principal_approval_received(
        @application.teacher_application
      ).deliver_now
    end
  end
end

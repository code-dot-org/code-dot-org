module Api::V1::Pd::Application
  class PrincipalApprovalApplicationsController < Api::V1::Pd::FormsController
    def new_form
      @application = Pd::Application::PrincipalApproval1819Application.new(
        # current_user may not exist but might as well record it
        user: current_user,
        application_guid: params.try(:[], :application_guid)
      )
    end
  end
end

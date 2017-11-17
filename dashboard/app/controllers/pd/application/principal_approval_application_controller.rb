module Pd::Application
  class PrincipalApprovalApplicationController < ApplicationController
    def new
      # Temporary security settings
      if Rails.env.production? && !current_user.try(:workshop_admin?) && Gatekeeper.disallows('pd_principal_approval_application')
        return render :not_available
      end

      @teacher_application = Pd::Application::Teacher1819Application.find_by(application_guid: params[:application_guid])

      if @teacher_application
        if Pd::Application::PrincipalApproval1819Application.exists?(application_guid: params[:application_guid])
          return render :submitted
        end
      else
        return render :not_found unless @teacher_application
      end
    end
  end
end

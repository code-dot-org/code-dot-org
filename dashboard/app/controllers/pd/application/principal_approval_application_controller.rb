module Pd::Application
  class PrincipalApprovalApplicationController < ApplicationController
    def new
      # Gatekeeper settings

      # Load principal application for this GUID
      @approval_application = Pd::Application::PrincipalApproval1819Application.find_by(application_guid: params[:application_guid])

      # If exists, render submitted
      return render :submitted if @approval_application

      # If not, load corresponding teacher application
      @teacher_application = Pd::Application::Teacher1819Application.find_by(application_guid: params[:application_guid])
      return render :not_found unless @teacher_application
    end
  end
end

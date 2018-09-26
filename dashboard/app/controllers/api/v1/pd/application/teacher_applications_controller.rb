module Api::V1::Pd::Application
  class TeacherApplicationsController < Api::V1::Pd::FormsController
    include Pd::Application::ApplicationConstants
    include Pd::Application::ActiveApplicationModels

    authorize_resource :teacher_application, class: 'Pd::Application::Teacher1819Application'

    def new_form
      @application = TEACHER_APPLICATION_CLASS.new(
        user: current_user
      )
    end

    def resend_principal_approval
      application = TEACHER_APPLICATION_CLASS.find(params[:id])
      application.queue_email :principal_approval, deliver_now: true
    end

    protected

    def on_successful_create
      @application.update_user_school_info!
      @application.queue_email :confirmation, deliver_now: true

      unless @application.regional_partner&.applications_principal_approval == RegionalPartner::SELECTIVE_APPROVAL
        @application.queue_email :principal_approval, deliver_now: true
      end
    end
  end
end

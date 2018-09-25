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
      PRINCIPAL_APPROVAL_APPLICATION_CLASS.create_placeholder_and_send_mail(
        TEACHER_APPLICATION_CLASS.find(params[:id])
      )
    end

    protected

    def on_successful_create
      @application.update_user_school_info!
      @application.queue_email(:confirmation, deliver_now: true)
    end
  end
end

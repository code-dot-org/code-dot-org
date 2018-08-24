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

    protected

    def on_successful_create
      @application.auto_score!
      @application.assign_default_workshop!
      @application.update_user_school_info!

      TEACHER_APPLICATION_MAILER_CLASS.confirmation(@application).deliver_now
      TEACHER_APPLICATION_MAILER_CLASS.principal_approval(@application).deliver_now
    end
  end
end

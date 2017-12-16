module Api::V1::Pd::Application
  class TeacherApplicationsController < Api::V1::Pd::FormsController
    authorize_resource :teacher_application, class: 'Pd::Application::Teacher1819Application'

    def new_form
      @application = Pd::Application::Teacher1819Application.new(
        user: current_user
      )
    end

    protected

    def on_successful_create
      @application.auto_score!

      ::Pd::Application::Teacher1819ApplicationMailer.confirmation(@application).deliver_now
      ::Pd::Application::Teacher1819ApplicationMailer.principal_approval(@application).deliver_now
    end
  end
end

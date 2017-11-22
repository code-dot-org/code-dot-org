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
      ::Pd::Application::Teacher1819ApplicationMailer.confirmation(@application).deliver_now
      # TODO(Andrew): Send principal approval email
    end
  end
end

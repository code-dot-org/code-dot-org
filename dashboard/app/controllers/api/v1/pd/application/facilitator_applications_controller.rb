module Api::V1::Pd::Application
  class FacilitatorApplicationsController < Api::V1::Pd::FormsController
    authorize_resource :facilitator_application, class: 'Pd::Application::Facilitator1819Application'

    def new_form
      @application = Pd::Application::Facilitator1819Application.new(
        user: current_user
      )
    end

    protected

    def on_successful_create
      @application.assign_default_workshop!
      @application.assign_default_fit_workshop!
      fit_workshop = @application.find_default_fit_workshop
      @application.fit_workshop_id = fit_workshop.id if fit_workshop

      ::Pd::Application::Facilitator1819ApplicationMailer.confirmation(@application).deliver_now
    end
  end
end

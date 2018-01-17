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
      workshop = @application.find_default_workshop
      @application.pd_workshop_id = workshop.id if workshop

      ::Pd::Application::Facilitator1819ApplicationMailer.confirmation(@application).deliver_now
    end
  end
end

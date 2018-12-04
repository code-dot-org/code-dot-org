module Api::V1::Pd::Application
  class FacilitatorApplicationsController < Api::V1::Pd::FormsController
    include Pd::Application::ActiveApplicationModels
    authorize_resource :facilitator_application, class: FACILITATOR_APPLICATION_CLASS

    def new_form
      @application = FACILITATOR_APPLICATION_CLASS.new(
        user: current_user
      )
    end

    protected

    def on_successful_create
      @application.assign_default_workshop!
      @application.assign_default_fit_workshop!
      fit_workshop = @application.find_default_fit_workshop
      @application.fit_workshop_id = fit_workshop.id if fit_workshop

      FACILITATOR_APPLICATION_MAILER_CLASS.confirmation(@application).deliver_now
    end
  end
end

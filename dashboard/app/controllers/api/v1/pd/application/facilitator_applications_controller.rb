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
      @application.queue_email :confirmation, deliver_now: true
    end
  end
end

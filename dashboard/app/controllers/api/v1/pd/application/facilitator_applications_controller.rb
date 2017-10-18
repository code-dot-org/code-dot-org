module Api::V1::Pd::Application
  class FacilitatorApplicationsController < Api::V1::Pd::FormsController
    authorize_resource :facilitator_application, class: 'Pd::Application::Facilitator1819Application'

    after_action :send_confirmation_email, only: :create

    def new_form
      @application = Pd::Application::Facilitator1819Application.new(
        user: current_user
      )
    end

    private

    def send_confirmation_email
      ::Pd::Application::Facilitator1819ApplicationMailer.confirmation(@application).deliver_now
    end
  end
end

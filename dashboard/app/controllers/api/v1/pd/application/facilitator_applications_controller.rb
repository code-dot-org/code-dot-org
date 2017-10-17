module Api::V1::Pd::Application
  class FacilitatorApplicationsController < Api::V1::Pd::FormsController
    authorize_resource :facilitator_application, class: 'Pd::Application::FacilitatorApplication1819'

    after_action :send_confirmation_email, only: :create

    def new_form
      @application = Pd::Application::FacilitatorApplication1819.new(
        user: current_user
      )
    end

    private

    def send_confirmation_email
      ::Pd::Application::FacilitatorApplication1819Mailer.confirmation(@application).deliver_now
    end
  end
end

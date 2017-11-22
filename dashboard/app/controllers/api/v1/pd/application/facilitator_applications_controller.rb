module Api::V1::Pd::Application
  class FacilitatorApplicationsController < Api::V1::Pd::FormsController
    authorize_resource :facilitator_application, class: 'Pd::Application::Facilitator1819Application'

    def new_form
      @application = Pd::Application::Facilitator1819Application.new(
        user: current_user
      )
    end

    def create
      # Ignore duplicate submissions. The UI should not allow this to happen anyway
      existing_form = Pd::Application::Facilitator1819Application.find_by(user: current_user)
      return render json: {id: existing_form.id}, status: :ok if existing_form

      super
    end

    protected

    def on_successful_create
      ::Pd::Application::Facilitator1819ApplicationMailer.confirmation(@application).deliver_now
    end
  end
end

class Api::V1::Pd::FitWeekend1819RegistrationsController < Api::V1::Pd::FormsController
  load_and_authorize_resource :application, class: 'Pd::Application::ApplicationBase', id_param: :applicationId

  def new_form
    ::Pd::FitWeekend1819Registration.new(
      pd_application_id: @application.id
    )
  end
end

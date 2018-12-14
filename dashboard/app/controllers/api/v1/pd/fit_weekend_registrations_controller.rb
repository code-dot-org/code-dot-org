class Api::V1::Pd::FitWeekendRegistrationsController < Api::V1::Pd::FormsController
  include Pd::Application::ActiveApplicationModels
  load_and_authorize_resource :application, class: 'Pd::Application::ApplicationBase', id_param: :applicationId

  def new_form
    FIT_WEEKEND_REGISTRATION_CLASS.new(
      pd_application_id: @application.id
    )
  end
end

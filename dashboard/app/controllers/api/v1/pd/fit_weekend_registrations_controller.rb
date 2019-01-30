class Api::V1::Pd::FitWeekendRegistrationsController < Api::V1::Pd::FormsController
  include Pd::Application::ActiveApplicationModels
  load_and_authorize_resource :application, class: 'Pd::Application::ApplicationBase', id_param: :applicationId

  def new_form
    @fit_registration = FIT_WEEKEND_REGISTRATION_CLASS.new(
      pd_application_id: @application.id
    )
  end

  def on_successful_create
    @application.enroll_user if @fit_registration.accepted?
  end
end

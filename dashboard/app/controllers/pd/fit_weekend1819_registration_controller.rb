class Pd::FitWeekend1819RegistrationController < ApplicationController
  load_and_authorize_resource :application,
    class: 'Pd::Application::ApplicationBase', find_by: :application_guid,
    id_param: :application_guid

  # here we handle the CanCan error manually so that we can present
  # non-authorized users with a custom page explaining that they must be logged
  # in as a facilitator account, rather than giving them the generic 404
  rescue_from CanCan::AccessDenied do
    render :unauthorized
  end

  def new
    if Pd::FitWeekend1819Registration.exists?(pd_application_id: @application.id)
      @registration = Pd::FitWeekend1819Registration.find_by(pd_application_id: @application.id)
      render :submitted
      return
    end

    @script_data = {
      props: {
        options: Pd::FitWeekend1819Registration.options.camelize_keys,
        requiredFields: Pd::FitWeekend1819Registration.camelize_required_fields,
        apiEndpoint: "/api/v1/pd/fit_weekend_registrations",
        applicationId: @application.id,
        course: @application.fit_workshop.course,
        city: @application.fit_workshop.location_city,
        date: @application.fit_workshop.friendly_date_range,
        email: @application.user.email,
        firstName: @application.first_name,
        lastName: @application.sanitize_form_data_hash[:last_name],
        phone: @application.sanitize_form_data_hash[:phone]
      }.to_json
    }
  end

  def destroy
    @application.fit_weekend_registration.try(:destroy)
  end
end

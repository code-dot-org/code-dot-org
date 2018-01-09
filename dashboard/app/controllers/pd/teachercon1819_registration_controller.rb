class Pd::Teachercon1819RegistrationController < ApplicationController
  load_and_authorize_resource :application, class: 'Pd::Application::ApplicationBase', find_by: :application_guid, id_param: :application_guid

  # here we handle the CanCan error manually so that we can present
  # non-authorized users with a custom page explaining that they must be logged
  # in as a facilitator account, rather than giving them the generic 404
  rescue_from CanCan::AccessDenied do
    render :unauthorized
  end

  def new
    # TODO: elijah create the Facilitator and Partner versions of this form and
    # remove this requirement
    if @application.application_type != "Teacher"
      render :invalid
      return
    end

    if Pd::Teachercon1819Registration.exists?(pd_application_id: @application.id)
      @registration = Pd::Teachercon1819Registration.find_by(pd_application_id: @application)
      render :submitted
      return
    end

    @script_data = {
      props: {
        options: Pd::Teachercon1819Registration.options.camelize_keys,
        requiredFields: Pd::Teachercon1819Registration.camelize_required_fields,
        apiEndpoint: "/api/v1/pd/teachercon1819_registrations",
        applicationType: @application.application_type,
        course: @application.workshop.course,
        city: @application.workshop.location_city,
        date: @application.workshop.friendly_date_range,
        email: @application.user.email,
        firstName: @application.first_name,
        lastName: @application.last_name,
        phone: @application.sanitize_form_data_hash[:phone]
      }.to_json
    }
  end
end

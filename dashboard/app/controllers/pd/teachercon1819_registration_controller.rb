class Pd::Teachercon1819RegistrationController < ApplicationController
  include Pd::Application::RegionalPartnerTeacherconMapping

  load_and_authorize_resource :application,
    class: 'Pd::Application::ApplicationBase', find_by: :application_guid,
    id_param: :application_guid, except: :partner

  # here we handle the CanCan error manually so that we can present
  # non-authorized users with a custom page explaining that they must be logged
  # in as a facilitator account, rather than giving them the generic 404
  rescue_from CanCan::AccessDenied do
    if current_user
      render :unauthorized
    else
      redirect_to '/users/sign_in'
    end
  end

  def new
    unless @application.application_type == "Teacher" || @application.application_type == "Facilitator"
      render :invalid
      return
    end

    unless @application.pd_workshop_id && Pd::Workshop.find(@application.pd_workshop_id).teachercon?
      render :invalid
      return
    end

    unless @application.locked? && @application.status == 'accepted'
      render :invalid
      return
    end

    if Pd::Teachercon1819Registration.exists?(pd_application_id: @application.id)
      @registration = Pd::Teachercon1819Registration.find_by(pd_application_id: @application)
      @email = {
        'Teacher' => 'teacher@code.org',
        'Facilitator' => 'facilitators@code.org',
      }[@application.application_type]
      render :submitted
      return
    end

    @script_data = {
      props: {
        options: Pd::Teachercon1819Registration.options.camelize_keys,
        requiredFields: Pd::Teachercon1819Registration.camelize_required_fields,
        apiEndpoint: "/api/v1/pd/teachercon_registrations",
        applicationId: @application.id,
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

  def partner
    unless current_user.regional_partners.count > 0
      render :unauthorized
      return
    end

    regional_partner = current_user.regional_partners.first
    teachercon = get_matching_teachercon(regional_partner)
    unless teachercon
      render :invalid
      return
    end

    if Pd::Teachercon1819Registration.exists?(regional_partner_id: regional_partner.id)
      @email = 'partner@code.org'
      render :submitted
      return
    end

    @script_data = {
      props: {
        options: Pd::Teachercon1819Registration.options.camelize_keys,
        requiredFields: Pd::Teachercon1819Registration.camelize_required_fields,
        apiEndpoint: "/api/v1/pd/teachercon_partner_registrations",
        regionalPartnerId: regional_partner.id,
        applicationType: "Partner",
        city: teachercon[:city],
        date: teachercon[:dates],
        email: current_user.email,
      }.to_json
    }

    render :new
  end
end

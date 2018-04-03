class Pd::Teachercon1819RegistrationController < ApplicationController
  include Pd::Application::RegionalPartnerTeacherconMapping

  load_and_authorize_resource :application,
    class: 'Pd::Application::ApplicationBase', find_by: :application_guid,
    id_param: :application_guid, except: [:partner, :partner_submitted, :lead_facilitator, :lead_facilitator_submitted]

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

    unless @application.locked? && ['accepted', 'withdrawn'].include?(@application.status)
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
    unless current_user.try(:permission?, UserPermission::PROGRAM_MANAGER)
      render :please_sign_in
      return
    end

    regional_partner = current_user.regional_partners.find_by(group: 3)
    unless regional_partner
      render :only_group_3
      return
    end

    teachercon = get_teachercon regional_partner

    unless teachercon
      render :invalid
      return
    end

    if Pd::Teachercon1819Registration.exists?(user: current_user)
      @seat_accepted = Pd::Teachercon1819Registration.find_by(user: current_user).accepted?
      @email = 'partner@code.org'
      render :partner_submitted
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

  def lead_facilitator
    unless current_user.try(:facilitator?)
      render :unauthorized
      return
    end

    teachercon = get_teachercon

    # Has this user registered for this teachercon already?
    registrations = Pd::Teachercon1819Registration.where(user: current_user).select {|r| r.sanitize_form_data_hash[:city] == teachercon[:city]}

    if registrations.any?
      @seat_accepted = registrations.first.accepted?
      render :lead_facilitator_submitted
      return
    end

    unless teachercon
      render :invalid
      return
    end

    @script_data = {
      props: {
        options: Pd::Teachercon1819Registration.options.camelize_keys,
        requiredFields: Pd::Teachercon1819Registration.camelize_required_fields,
        apiEndpoint: "/api/v1/pd/teachercon_lead_facilitator_registrations",
        applicationType: "LeadFacilitator",
        city: teachercon[:city],
        date: teachercon[:dates],
        email: current_user.email
      }.to_json
    }
    render :new
  end

  private

  def get_teachercon(regional_partner = nil)
    if params[:city].present?
      TEACHERCONS.detect {|tc| tc[:city] == params[:city].titleize}
    else
      get_matching_teachercon(regional_partner)
    end
  end
end

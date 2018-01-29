class Api::V1::Pd::Teachercon1819RegistrationsController < Api::V1::Pd::FormsController
  load_and_authorize_resource :application, class: 'Pd::Application::ApplicationBase', id_param: :applicationId, except: :create_partner

  def new_form
    ::Pd::Teachercon1819Registration.new(
      pd_application_id: @application.id
    )
  end

  def create_partner
    regional_partner_id = params.try(:[], :regionalPartnerId)
    regional_partner = RegionalPartner.find(regional_partner_id)
    unless regional_partner && current_user.regional_partners.include?(regional_partner)
      return head :unauthorized
    end

    form_data_hash = params.try(:[], :form_data) || {}
    form_data_json = form_data_hash.to_unsafe_h.to_json.strip_utf8mb4

    form = ::Pd::Teachercon1819Registration.new(
      regional_partner_id: regional_partner_id
    )
    form.form_data_hash = JSON.parse(form_data_json)

    # Check for idempotence
    existing_form = form.check_idempotency
    return render json: {id: existing_form.id}, status: :ok if existing_form

    if form.save
      render json: {id: form.id}, status: :created
      on_successful_create
    else
      return_data = {
        errors: form.errors.messages
      }

      form.try(:add_general_errors, return_data)
      render json: return_data, status: :bad_request
    end
  end
end

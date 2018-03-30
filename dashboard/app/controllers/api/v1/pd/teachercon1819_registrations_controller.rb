class Api::V1::Pd::Teachercon1819RegistrationsController < Api::V1::Pd::FormsController
  load_and_authorize_resource :application, class: 'Pd::Application::ApplicationBase', id_param: :applicationId, except: :create_partner_or_lead_facilitator

  def new_form
    ::Pd::Teachercon1819Registration.new(
      pd_application_id: @application.id,
      user: current_user
    )
  end

  def create_partner_or_lead_facilitator
    if params[:regionalPartnerId].present?
      unless current_user && current_user.regional_partner_ids.include?(params[:regionalPartnerId].to_i)
        return head :forbidden
      end
    end

    form_data_hash = params[:form_data] || {}
    form_data_json = form_data_hash.to_unsafe_h.to_json.strip_utf8mb4

    form = ::Pd::Teachercon1819Registration.new(
      regional_partner_id: params[:regionalPartnerId],
      user_id: current_user.id
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

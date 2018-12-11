class Api::V1::Pd::FormsController < ::ApplicationController
  def new_form
    raise "Abstract method must be overridden by inheriting class"
  end

  def create
    form_data_hash = params.try(:[], :form_data) || {}
    form_data_json = form_data_hash.to_unsafe_h.to_json.strip_utf8mb4

    form = new_form
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

  rescue_from 'ActiveRecord::RecordNotUnique' do
    head :conflict
  end

  protected

  def create_params
    params.permit(:form_data)
  end

  # Override to perform custom actions after a successful form creation,
  # e.g. sending confirmation email
  def on_successful_create
  end
end

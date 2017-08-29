class Api::V1::Pd::FormsController < ::ApplicationController
  def new_form
    raise "Abstract method must be overridden by inheriting class"
  end

  def create
    form_data_hash = params.try(:[], :form_data) || {}
    form_data_json = form_data_hash.to_unsafe_h.to_json.strip_utf8mb4

    form = new_form
    form.form_data_hash = JSON.parse(form_data_json)
    form.save

    if form.valid?
      render json: {id: form.id}, status: :created
    else
      return_data = {
        errors: form.errors.messages
      }

      form.add_general_errors(return_data)
      render json: return_data, status: :bad_request
    end
  end
end

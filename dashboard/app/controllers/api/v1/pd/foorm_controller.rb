class Api::V1::Pd::FoormController < ::ApplicationController
  # POST api/v1/pd/foorm/form_with_library_items
  def fill_in_library_items
    form_questions = params[:form_questions].as_json
    filled_in_form = Foorm::Form.fill_in_library_items(form_questions)
    render json: filled_in_form
  end

  # GET api/v1/pd/foorm/form_questions
  def get_form_questions
    form_name = params[:name]
    form_version = params[:version]
    form_questions = JSON.parse(Foorm::Form.where(name: form_name, version: form_version).first&.questions)
    render json: form_questions
  end

  def validate_questions
    form_questions = params[:form_questions].as_json
    begin
      Foorm::Form.validate_questions(form_questions)
    rescue StandardError => e
      return render json: {state: "invalid form", error: e.message}, status: 500
    end
    render json: {state: "valid form"}, status: 200
  end
end

class Api::V1::Pd::Foorm::FormsController < ApplicationController
  include Api::CsvDownload

  # POST api/v1/pd/foorm/forms/form_with_library_items
  def fill_in_library_items
    form_questions = params[:form_questions].as_json
    begin
      filled_in_form = Foorm::Form.fill_in_library_items(form_questions)
      render json: filled_in_form
    rescue => e
      render status: 500, json: {error: e.message}
    end
  end

  # GET api/v1/pd/foorm/forms/:id
  def get_form_data
    form_data = Foorm::Form.find(params[:id])
    if form_data
      data_to_return = {
        questions: JSON.parse(form_data.questions),
        published: form_data.published,
        name: form_data.name,
        version: form_data.version,
        id: form_data.id
      }
      render json: data_to_return
    else
      render json: {}
    end
  end

  # GET api/v1/pd/foorm/forms/form_names
  def get_form_names_and_versions
    forms = Foorm::Form.all.map do |form|
      {
        name: form.name,
        version: form.version,
        id: form.id
      }
    end
    render json: forms
  end

  # GET api/v1/pd/foorm/forms/submissions_csv
  # Get all submissions for the given form as a csv. Only workshop admins can
  # get this data.
  def get_submissions_as_csv
    return render_404 unless current_user.workshop_admin?

    form_name = params[:name]
    form_version = params[:version]
    start_date = params[:start_date]
    end_date = params[:end_date]
    form = Foorm::Form.where(name: form_name, version: form_version).first
    filename = "#{form_name}_submissions.csv"
    submissions = nil
    if start_date || end_date
      # we did not start using foorm until May 2020, if no start date was provided use 5/1/2020
      start_date = start_date ? DateTime.parse(start_date) : DateTime.new(2020, 5, 1, 0, 0, 0)
      end_date = end_date ? DateTime.parse(end_date) : DateTime.now
      time_range = start_date..end_date
      submissions = form.submissions.where(created_at: time_range)
    end
    csv = form.submissions_to_csv(submissions)
    send_csv_attachment(csv, filename)
  end

  # POST api/v1/pd/foorm/forms/validate_form
  def validate_form
    authorize! :validate_form, :pd_foorm

    form_questions = params[:form_questions].as_json
    errors = Foorm::Form.validate_questions(form_questions)
    if errors.empty?
      return render status: 200, json: {}
    else
      return render status: 500, json: {error: errors}
    end
  end
end

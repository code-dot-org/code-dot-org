require 'csv'

class AilabDatasetsController < ApplicationController
  # Students load the files of a stored dataset, so `csv` and `metadata` need no sign-in.
  before_action :authenticate_user!, only: [:create]
  before_action :require_levelbuilder_mode, only: [:create]
  authorize_resource class: false, only: [:create]
  before_action :require_stored_dataset, only: [:csv, :metadata]

  # The files go into the repository, so a very large upload is refused.
  MAX_CSV_BYTES = 5.megabytes
  MIN_ROW_COUNT = 2

  # POST /ailab_datasets
  def create
    errors = validation_errors
    return render status: :unprocessable_entity, json: {errors: errors} if errors.any?

    AilabDatasets.save(
      id: params[:id],
      name: params[:name].strip,
      is_toy: params[:is_toy] == 'true',
      row_count: params[:row_count].to_i,
      csv: csv_text,
      metadata: parsed_metadata
    )
    render json: AilabDatasets.stored(params[:id])
  end

  # GET /ailab_datasets/:id/csv
  def csv
    send_dataset_file AilabDatasets.csv_file(params[:id]), 'text/csv'
  end

  # GET /ailab_datasets/:id/metadata
  def metadata
    send_dataset_file AilabDatasets.metadata_file(params[:id]), 'application/json'
  end

  private def send_dataset_file(file, type)
    expires_in 1.hour, public: true
    send_file file.to_s, type: type, disposition: 'inline'
  end

  private def require_stored_dataset
    head :not_found unless AilabDatasets.stored(params[:id])
  end

  private def validation_errors
    errors = []
    errors << "ID: use only letters, numbers, hyphens and underscores, other than \"#{AilabDatasets::MANIFEST_NAME}\"" unless AilabDatasets.valid_id?(params[:id])
    errors << 'Name: must not be blank' if params[:name].blank?
    errors << "Row count: must be #{MIN_ROW_COUNT} or more" unless params[:row_count].to_i >= MIN_ROW_COUNT
    errors += csv_errors + metadata_errors
    errors.any? ? errors : column_errors
  end

  private def csv_errors
    csv = params[:csv]
    return ['CSV: must be a file'] unless csv.is_a?(ActionDispatch::Http::UploadedFile)
    return ["CSV: must be #{MAX_CSV_BYTES / 1.megabyte} MB or less"] if csv.size > MAX_CSV_BYTES
    []
  end

  private def metadata_errors
    return ['Metadata: must be a JSON object'] unless parsed_metadata.is_a?(Hash)
    return ["Metadata: the name #{parsed_metadata['name'].inspect} is not the dataset ID"] unless parsed_metadata['name'] == params[:id]
    return ['Metadata: fields must be a list of objects'] unless metadata_fields.is_a?(Array) && metadata_fields.all?(Hash)
    []
  rescue JSON::ParserError
    ['Metadata: is not valid JSON']
  end

  private def column_errors
    columns = CSV.parse_line(csv_text.dup.force_encoding(Encoding::UTF_8).scrub.delete_prefix("\uFEFF")) || []
    (metadata_fields.pluck('id') - columns).map {|id| "Metadata: the CSV has no column #{id.inspect}"}
  rescue CSV::MalformedCSVError
    ['CSV: is not valid CSV']
  end

  private def csv_text
    @csv_text ||= params[:csv].read
  end

  private def parsed_metadata
    @parsed_metadata ||= JSON.parse(params[:metadata].to_s)
  end

  private def metadata_fields
    parsed_metadata['fields'] || []
  end
end

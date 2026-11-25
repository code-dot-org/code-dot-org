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
      csv: params[:csv].read,
      metadata: JSON.parse(params[:metadata])
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
    errors << 'ID: use only letters, numbers, hyphens and underscores' unless AilabDatasets.valid_id?(params[:id])
    errors << 'Name: must not be blank' if params[:name].blank?
    errors << "Row count: must be #{MIN_ROW_COUNT} or more" unless params[:row_count].to_i >= MIN_ROW_COUNT
    errors + csv_errors + metadata_errors
  end

  private def csv_errors
    csv = params[:csv]
    return ['CSV: must be a file'] unless csv.is_a?(ActionDispatch::Http::UploadedFile)
    return ["CSV: must be #{MAX_CSV_BYTES / 1.megabyte} MB or less"] if csv.size > MAX_CSV_BYTES
    []
  end

  private def metadata_errors
    metadata = JSON.parse(params[:metadata].to_s)
    return ['Metadata: must be a JSON object'] unless metadata.is_a?(Hash)
    return ["Metadata: the name #{metadata['name'].inspect} is not the dataset ID"] unless metadata['name'] == params[:id]
    []
  rescue JSON::ParserError
    ['Metadata: is not valid JSON']
  end
end

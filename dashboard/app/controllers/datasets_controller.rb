require 'json'
require 'uri'

class DatasetsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_levelbuilder_mode
  authorize_resource class: false

  LIVE_DATASETS = ['Daily Weather', 'Top 200 USA', 'Top 200 Worldwide', 'Viral 50 USA', 'Viral 50 Worldwide',
                   'Top 50 USA', 'Top 50 Worldwide', 'COVID-19 Cases per US State']

  # GET /datasets
  def index
    @datasets = DatablockStorageTable.get_shared_table_names
    @live_datasets = LIVE_DATASETS
  end

  # GET /datasets/:dataset_name/
  def show
    @table_name = params[:dataset_name]
    begin
      table = DatablockStorageTable.find_shared_table @table_name
      @dataset = {
        columns: table.get_columns,
        records: table.read_records.map(&:to_json),
      }
    rescue
      # This must be a new shared table, so no existing dataset
      @dataset = {
        columns: [],
        records: [],
      }
    end
    @live_datasets = LIVE_DATASETS
  end

  # POST /datasets/:dataset_name/
  def update
    table_name = params[:dataset_name]

    # Find or create the shared table
    table = begin
      DatablockStorageTable.find_shared_table table_name
    rescue
      DatablockStorageTable.create!(project_id: DatablockStorageTable::SHARED_TABLE_PROJECT_ID, table_name: table_name)
    end

    table.import_csv params[:csv_data]
    data = {
      columns: table.get_columns,
      records: table.read_records.map(&:to_json),
    }
    render json: data
  end

  # DELETE /datasets/:dataset_name/
  def destroy
    table_name = params[:dataset_name]
    table = DatablockStorageTable.find_shared_table table_name
    table.destroy!
  end

  # GET /datasets/manifest/edit
  def edit_manifest
    @dataset_library_manifest = DatablockStorageLibraryManifest.instance.library_manifest
  end

  # POST /datasets/manifest/update
  def update_manifest
    parsed_manifest = JSON.parse(params['manifest'])
    db_manifest = DatablockStorageLibraryManifest.instance
    db_manifest.library_manifest = parsed_manifest
    db_manifest.save!
    render json: {}
  rescue JSON::ParserError
    render json: {msg: 'Invalid JSON'}
  end
end

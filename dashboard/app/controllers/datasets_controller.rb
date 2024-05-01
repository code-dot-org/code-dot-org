# TODO: unfirebase, migrate this to datablock storage, ok to be migrated but not enabled: #56998
# TODO: post-firebase-cleanup, switch to the datablock storage version: #56994

require 'json'
require 'uri'

class DatasetsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_levelbuilder_mode
  before_action :initialize_firebase
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
  # TODO: unfirebase, #56998
  def update
    records, columns = @firebase.csv_as_table(params[:csv_data])
    @firebase.delete_shared_table params[:dataset_name]
    response = @firebase.upload_shared_table(params[:dataset_name], records, columns)
    data = {}
    if response.success?
      data[:records] = records
      data[:columns] = columns
    end
    render json: data, status: response.code
  end

  # DELETE /datasets/:dataset_name/
  # TODO: unfirebase, #56998
  def destroy
    response = @firebase.delete_shared_table params[:dataset_name]
    render json: {}, status: response.code
  end

  # GET /datasets/manifest/edit
  # TODO: unfirebase, #56998
  def edit_manifest
    @dataset_library_manifest = @firebase.get_library_manifest
  end

  # POST /datasets/manifest/update
  # TODO: unfirebase, #56998
  def update_manifest
    parsed_manifest = JSON.parse(params['manifest'])
    response = @firebase.set_library_manifest parsed_manifest
    render json: {}, status: response.code
  rescue JSON::ParserError
    render json: {msg: 'Invalid JSON'}
  end

  private def initialize_firebase
    @firebase = FirebaseHelper.new('shared')
  end
end

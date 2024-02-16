require 'json'
require 'uri'
require 'datablock_storage'

class DatasetsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_levelbuilder_mode
  authorize_resource class: false

  LIVE_DATASETS = ['Daily Weather', 'Top 200 USA', 'Top 200 Worldwide', 'Viral 50 USA', 'Viral 50 Worldwide',
                   'Top 50 USA', 'Top 50 Worldwide', 'COVID-19 Cases per US State', 'COVID-19 Cases per Country']

  # GET /datasets
  def index
    tables = DatablockStorage.get_shared_table_list # TODO: unfirebase
    @datasets = tables.map {|name, _| name}
    @live_datasets = LIVE_DATASETS
  end

  # GET /datasets/:dataset_name/
  def show
    @table_name = params[:dataset_name]
    @dataset = DatablockStorage.get_shared_table params[:dataset_name] # TODO: unfirebase
    @live_datasets = LIVE_DATASETS
  end

  # POST /datasets/:dataset_name/
  def update
    records, columns = DatablockStorage.csv_as_table(params[:csv_data]) # TODO: unfirebase
    DatablockStorage.delete_shared_table params[:dataset_name] # TODO: unfirebase
    response = DatablockStorage.upload_shared_table(params[:dataset_name], records, columns) # TODO: unfirebase
    data = {}
    if response.success?
      data[:records] = records
      data[:columns] = columns
    end
    render json: data, status: response.code
  end

  # DELETE /datasets/:dataset_name/
  def destroy
    response = DatablockStorage.delete_shared_table params[:dataset_name] # TODO: unfirebase
    render json: {}, status: response.code
  end

  # GET /datasets/manifest/edit
  def edit_manifest
    @dataset_library_manifest = DatablockStorage.get_library_manifest # TODO: unfirebase
  end

  # POST /datasets/manifest/update
  def update_manifest
    parsed_manifest = JSON.parse(params['manifest'])
    response = DatablockStorage.set_library_manifest parsed_manifest # TODO: unfirebase
    render json: {}, status: response.code
  rescue JSON::ParserError
    render json: {msg: 'Invalid JSON'}
  end
end

require 'URI'

class DatasetsController < ApplicationController
  before_action :require_levelbuilder_mode
  before_action :initialize_firebase
  authorize_resource class: false

  LIVE_DATASETS = ['Daily Weather', 'Top 200 USA', 'Top 200 Worldwide', 'Viral 50 USA', 'Viral 50 Worldwide']

  def index
    tables = @firebase.get_shared_table_list
    @datasets = tables.map {|name, _| name}
    @live_datasets = LIVE_DATASETS
  end

  def show
    @table_name = params[:dataset_name]
    @dataset = @firebase.get_shared_table URI.escape(params[:dataset_name])
    @live_datasets = LIVE_DATASETS
  end

  # POST /datasets/:dataset/edit
  def update
    p params
    records, columns = @firebase.csv_as_table(params[:csv_data])
    p columns
    @firebase.delete_shared_table URI.escape(params[:dataset_name])
    response = @firebase.upload_shared_table(URI.escape(params[:dataset_name]), records, columns)
    p response
    data = {status: response.code}
    if response.success?
      data[:records] = records
      data[:columns] = columns
    end
    render json: data
  end

  # GET /datasets/manifest
  def edit_manifest
    @dataset_library_manifest = @firebase.get_library_manifest
  end

  # POST /datasets/manifest
  def update_manifest
  end

  private

  def initialize_firebase
    @firebase = FirebaseHelper.new('shared')
  end
end

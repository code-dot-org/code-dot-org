require 'URI'

class DatasetsController < ApplicationController
  before_action :require_levelbuilder_mode
  before_action :initialize_firebase
  authorize_resource class: false

  def index
    tables = @firebase.get_shared_table_list
    @datasets = tables.map {|name, _| name}
  end

  def edit
    @table_name = params[:dataset]
    @dataset = @firebase.get_shared_table URI.escape(params[:dataset])
  end

  # POST /datasets/:dataset/edit
  def upload
    p params
    records, columns = @firebase.csv_as_table(params[:csv_data])
    p columns
    @firebase.delete_shared_table URI.escape(params[:dataset])
    response = @firebase.upload_shared_table(URI.escape(params[:dataset]), records, columns)
    p response
    data = {status: response.code}
    if response.success?
      data[:records] = records
      data[:columns] = columns
    end
    render json: data
  end

  # GET /datasets/manifest
  def show_manifest
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

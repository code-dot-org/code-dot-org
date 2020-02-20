require 'json'

class DatasetsController < ApplicationController
  before_action :require_levelbuilder_mode
  before_action :initialize_firebase
  authorize_resource class: false

  LIVE_DATASETS = ['Daily Weather', 'Top 200 USA', 'Top 200 Worldwide', 'Viral 50 USA', 'Viral 50 Worldwide']

  # GET /datasets
  def index
    tables = @firebase.get_shared_table_list
    @datasets = tables.map {|name, _| name}
    @live_datasets = LIVE_DATASETS
  end

  # GET /datasets/:dataset_name/
  def show
  end

  # POST /datasets/:dataset_name/
  def update
  end

  # GET /datasets/manifest/edit
  def edit_manifest
    @dataset_library_manifest = @firebase.get_library_manifest
  end

  # POST /datasets/manifest/update
  def update_manifest
    parsed_manifest = JSON.parse(params['manifest'])
    response = @firebase.set_library_manifest parsed_manifest
    return head response.code
  rescue JSON::ParserError
    render json: {msg: 'Invalid JSON'}
  end

  private

  def initialize_firebase
    @firebase = FirebaseHelper.new('shared')
  end
end

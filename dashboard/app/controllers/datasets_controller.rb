class DatasetsController < ApplicationController
  before_action :require_levelbuilder_mode
  before_action :initialize_firebase
  authorize_resource class: false

  def index
    manifest = @firebase.get_library_manifest
    @datasets = manifest['tables'].map {|table| table['name']}
  end

  def edit
    @table_name = params[:dataset]
    @dataset = @firebase.get_shared_table(params[:dataset])
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

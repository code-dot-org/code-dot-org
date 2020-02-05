class DatasetsController < ApplicationController
  before_action :require_levelbuilder_mode
  before_action :initialize_firebase

  def show_manifest
    @dataset_library_manifest = @firebase.get_library_manifest
  end

  def update_manifest
  end

  private

  def initialize_firebase
    @firebase = FirebaseHelper.new('shared')
  end
end

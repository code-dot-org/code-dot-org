require 'json'

class DatasetsController < ApplicationController
  before_action :require_levelbuilder_mode
  before_action :initialize_firebase

  def show_manifest
    @dataset_library_manifest = @firebase.get_library_manifest
  end

  def update_manifest
    parsed = JSON.parse(params['manifest'])
    response = @firebase.set_library_manifest parsed
    if response.success?
      render json: {status: response.code}
    else
      render json: {status: response.code, msg: response.body}
    end
  rescue JSON::ParserError
    render json: {msg: 'Invalid JSON'}
  end

  private

  def initialize_firebase
    @firebase = FirebaseHelper.new('shared')
  end
end

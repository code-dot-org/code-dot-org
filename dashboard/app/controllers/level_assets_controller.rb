class LevelAssetsController < ApplicationController
  before_action :require_levelbuilder_mode
  before_action :authenticate_user!

  def upload
    authorize! :create, Level
    filename = AWS::S3.upload_to_bucket('images.code.org', params[:file].original_filename, open(params[:file]), acl: 'public-read')
    render json: { newAssetUrl: "https://images.code.org/#{filename}" }
  end
end

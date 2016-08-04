class LevelAssetsController < ApplicationController
  before_filter :require_levelbuilder_mode
  before_filter :authenticate_user!

  def upload
    authorize! :create, Level
    filename = AWS::S3.upload_to_bucket('images.code.org', params[:file].original_filename, open(params[:file]), acl: 'public-read')
    render json: { newAssetUrl: "https://images.code.org/#{filename}" }
  end
end

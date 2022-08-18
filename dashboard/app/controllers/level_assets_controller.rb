class LevelAssetsController < ApplicationController
  before_action :require_levelbuilder_mode
  before_action :authenticate_user!

  def upload
    authorize! :create, Level

    # Only allow images that are <= 2MB
    if params[:file].size > 2.megabyte
      return render json: {
        message: "asset too large; images must be no larger than 2MB",
        status: :payload_too_large
      }, status: :payload_too_large
    end

    filename = AWS::S3.upload_to_bucket('images.code.org', params[:file].original_filename, File.open(params[:file]), acl: 'public-read')
    render json: {newAssetUrl: "https://images.code.org/#{filename}"}
  end
end

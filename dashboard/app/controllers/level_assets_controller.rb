class LevelAssetsController < ApplicationController
  before_filter :can_upload?
  before_filter :authenticate_user!

  def upload
    authorize! :create, :level
    filename = AWS::S3.upload_to_bucket('images.code.org', params[:file].original_filename, open(params[:file]), access: :public_read)
    render json: { newAssetUrl: "https://images.code.org/#{filename}" }
  end

  private

  def can_upload?
    unless Rails.env.levelbuilder? || Rails.env.development?
      raise CanCan::AccessDenied.new('Cannot create or modify levels from this environment.')
    end
  end
end

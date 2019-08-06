class LevelStarterAssetsController < ApplicationController
  S3_BUCKET = 'cdo-v3-assets'.freeze
  S3_PREFIX = 'starter_assets/'.freeze

  # GET /level_starter_assets/:id
  def show
    starter_asset_urls = get_object_summaries(params[:id]).map {|obj| obj.size.zero? ? nil : obj.public_url}.compact
    render json: {starter_asset_urls: starter_asset_urls}
  end

  private

  # Returns S3_BUCKET objects in the S3_PREFIX/id directory.
  def get_object_summaries(id)
    bucket.objects(prefix: S3_PREFIX + id)
  end

  def bucket
    Aws::S3::Bucket.new(S3_BUCKET)
  end
end

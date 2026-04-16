class JSONVideosController < ApplicationController
  before_action :authenticate_user!

  # GET /json_videos/:id/content
  # Fetches the JSON video file from S3 and returns it directly, keeping S3
  # credentials server-side.
  def content
    video = JSONVideo.find_by!(key: params[:id])
    bucket, key = parse_s3_uri(video.s3_uri)
    body = AWS::S3.download_from_bucket(bucket, key)
    render plain: body, content_type: 'application/json'
  rescue ActiveRecord::RecordNotFound
    head :not_found
  rescue => exception
    CDO.log.error "Failed to fetch json video #{params[:id]} from S3: #{exception.message}"
    head :bad_gateway
  end

  private def parse_s3_uri(uri)
    # "s3://bucket/path/to/key" → ["bucket", "path/to/key"]
    uri.sub('s3://', '').split('/', 2)
  end
end

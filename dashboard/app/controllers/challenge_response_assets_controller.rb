class ChallengeResponseAssetsController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  # GET /challenge_response_assets/:id
  #
  # Returns the asset with a fresh presigned download URL. Useful for refreshing
  # a single asset's URL after the one from the response show has expired.
  def show
    render json: @challenge_response_asset.summarize
  end

  # PUT /challenge_response_assets/:id/upload
  #
  # Receives the raw asset bytes in the request body and stores them at the
  # asset's S3 key. Uploads go through dashboard rather than directly to S3
  # because the user-content bucket has no CORS rules for browser PUTs.
  # Only the response's owner may upload (see Ability).
  def upload
    content_type = request.content_type
    unless @challenge_response_asset.accepts_content_type?(content_type)
      return render status: :unsupported_media_type,
        json: {error: "Unsupported content type #{content_type.inspect} for #{@challenge_response_asset.asset_type}"}
    end

    data = request.body.read(ChallengeResponseAsset.max_upload_bytes + 1)
    if data.blank?
      return render status: :bad_request, json: {error: 'Empty request body'}
    end
    if data.bytesize > ChallengeResponseAsset.max_upload_bytes
      return render status: :payload_too_large,
        json: {error: "Asset exceeds the #{ChallengeResponseAsset.max_upload_bytes} byte limit"}
    end

    @challenge_response_asset.upload(data, content_type: content_type)
    render json: @challenge_response_asset.summarize
  end
end

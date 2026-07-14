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
end
